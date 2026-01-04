package com.shieldcall.mobile.service

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import androidx.core.app.NotificationCompat
import com.shieldcall.mobile.MainActivity
import com.shieldcall.mobile.R
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class AudioService : Service() {

    private val CHANNEL_ID = "ShieldCallServiceChannel"
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    private var speechRecognizer: SpeechRecognizer? = null
    private var recognitionIntent: Intent? = null
    private var isListening = false
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification("Shield Active", "Monitoring conversation for threats...")
        startForeground(1, notification)

        connectWebSocket()
        // Initialize Speech Recognition on Main Thread
        handler.post { setupSpeechRecognition() }

        return START_STICKY
    }

    private fun setupSpeechRecognition() {
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
            recognitionIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                // Try to keep it running
                putExtra("android.speech.extra.DICTATION_MODE", true)
            }

            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                
                override fun onEndOfSpeech() {
                    // Restart listening to make it continuous
                    if (isListening) {
                        speechRecognizer?.startListening(recognitionIntent)
                    }
                }

                override fun onError(error: Int) {
                    // Silently restart on error (e.g. no match)
                     if (isListening) {
                         // Delay slightly to prevent loop crash
                         handler.postDelayed({ speechRecognizer?.startListening(recognitionIntent) }, 500)
                     }
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        val text = matches[0]
                        sendTranscript(text)
                    }
                    if (isListening) speechRecognizer?.startListening(recognitionIntent)
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        val text = matches[0]
                        sendTranscript(text)
                    }
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}
            })

            isListening = true
            speechRecognizer?.startListening(recognitionIntent)
        } else {
            Log.e("AudioService", "Speech Recognition Not Available")
        }
    }

    private fun connectWebSocket() {
        val ip = getSharedPreferences("ShieldCallPrefs", Context.MODE_PRIVATE).getString("server_ip", "10.0.2.2") ?: "10.0.2.2"
        val request = Request.Builder().url("ws://$ip:8000/ws/monitor").build()
        
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                val payload = JSONObject().apply {
                    put("type", "REGISTER_DEVICE")
                    put("device_id", android.provider.Settings.Secure.getString(contentResolver, android.provider.Settings.Secure.ANDROID_ID))
                    put("device_name", "${Build.MANUFACTURER} ${Build.MODEL}")
                }
                webSocket.send(payload.toString())
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    if (json.optString("type") == "NEW_THREAT") {
                        val scamType = json.optString("scam_type")
                        val risk = json.optInt("risk_score")
                        showThreatAlert(scamType, risk)
                    }
                } catch (e: Exception) {
                    Log.e("AudioService", "WS Error: ${e.message}")
                }
            }
            
             override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                 // Try reconnect logic if needed, or simple close
                 super.onClosing(webSocket, code, reason)
             }
             
             override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                 Log.e("AudioService", "WS Connection Failed: ${t.message}")
             }
        })
    }
    
    private fun sendTranscript(text: String) {
        val payload = JSONObject().apply {
            put("type", "AUDIO_CHUNK")
            put("text", text)
        }
        webSocket?.send(payload.toString())
    }

    private fun showThreatAlert(scamType: String, risk: Int) {
        val channelId = "ShieldCallAlerts"
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Threat Alerts", NotificationManager.IMPORTANCE_HIGH)
            manager.createNotificationChannel(channel)
        }
        
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("⚠️ POTENTIAL SCAM DETECTED!")
            .setContentText("$scamType (Risk: $risk%)")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .build()
            
        manager.notify(System.currentTimeMillis().toInt(), notification)
    }

    override fun onDestroy() {
        isListening = false
        handler.post {
            speechRecognizer?.stopListening()
            speechRecognizer?.destroy()
        }
        webSocket?.close(1000, "Service Destroyed")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "ShieldCall Service Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(title: String, content: String): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .build()
    }
}
