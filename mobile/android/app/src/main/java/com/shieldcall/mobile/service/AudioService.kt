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
                    if (isListening) {
                        // Debounce restart to prevent "on/off" loop
                        val delay = if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) 500L else 2000L
                        handler.postDelayed({ safeStartListening() }, delay)
                    }
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        sendTranscript(matches[0])
                    }
                    if (isListening) safeStartListening()
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        sendTranscript(matches[0]) // Stream partials for faster detection
                    }
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}
            })

            isListening = true
            safeStartListening()
        } else {
            Log.e("AudioService", "Speech Recognition Not Available")
        }
    }

    private fun safeStartListening() {
        if (!isListening) return
        try {
            speechRecognizer?.startListening(recognitionIntent)
        } catch (e: Exception) {
            // Service might be busy or unavailable
            Log.e("AudioService", "Start listening failed: ${e.message}")
        }
    }

    private fun connectWebSocket() {
        val baseUrl = getSharedPreferences("ShieldCallPrefs", Context.MODE_PRIVATE).getString("server_url", "http://10.0.2.2:8000") ?: "http://10.0.2.2:8000"
        
        // Convert HTTP/S to WS/S
        val wsUrl = when {
            baseUrl.startsWith("https://") -> baseUrl.replace("https://", "wss://")
            baseUrl.startsWith("http://") -> baseUrl.replace("http://", "ws://")
            else -> "ws://$baseUrl"
        }

        val request = Request.Builder().url("$wsUrl/ws/monitor").build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d("AudioService", "WebSocket Connected to $wsUrl")
                val deviceName = "${Build.MANUFACTURER} ${Build.MODEL}"
                val json = JSONObject().apply {
                    put("type", "REGISTER_DEVICE")
                    put("device_id", android.provider.Settings.Secure.getString(contentResolver, android.provider.Settings.Secure.ANDROID_ID))
                    put("device_name", deviceName)
                }
                webSocket.send(json.toString())
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    if (json.optString("type") == "NEW_THREAT") {
                        val risk = json.optInt("risk_score", 0)
                        val type = json.optString("scam_type", "Unknown")
                        if (risk > 70) { // Server confirms threat
                            showThreatAlert(type, risk)
                        }
                    }
                } catch (e: Exception) {
                    Log.e("AudioService", "Message parse error: ${e.message}")
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("AudioService", "WebSocket Failure: ${t.message}")
                // Retry?
            }
        })
    }

    private fun sendTranscript(text: String) {
        val json = JSONObject().apply {
            put("type", "AUDIO_CHUNK")
            put("text", text)
        }
        webSocket?.send(json.toString())
        Log.d("AudioService", "Sent: $text")
    }

    @SuppressLint("MissingPermission")
    private fun showThreatAlert(scamType: String, risk: Int) {
        val channelId = "ShieldCallAlerts"
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Threat Alerts", NotificationManager.IMPORTANCE_HIGH)
            channel.enableVibration(true)
            channel.vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 1000)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
        
        // Launch Main Activity with warning flag? Or just high-priority notification.
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("THREAT_ALERT", true)
            putExtra("THREAT_TYPE", scamType)
        }
        val pendingIntent = PendingIntent.getActivity(this, 1, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("🚨 POTENTIAL SCAM DETECTED!")
            .setContentText("$scamType (Risk: $risk%)")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .setFullScreenIntent(pendingIntent, true) // Red Screen Overlay effect via Activity
            .setAutoCancel(true)
            .build()
            
        try {
            androidx.core.app.NotificationManagerCompat.from(this).notify(System.currentTimeMillis().toInt(), notification)
        } catch (e: Exception) {
            Log.e("AudioService", "Notify failed: ${e.message}")
        }
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
