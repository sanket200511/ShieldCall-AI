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
import android.os.PowerManager
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import androidx.core.app.NotificationCompat
import com.shieldcall.mobile.MainActivity
import com.shieldcall.mobile.R
import com.shieldcall.mobile.ThreatAlertActivity
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

    private var wakeLock: PowerManager.WakeLock? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        // Acquire WakeLock to keep CPU running during listening
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ShieldCall::AudioServiceWakelock")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification("Shield Active", "Continuous protection enabled.")
        startForeground(1, notification)
        
        try {
            if (wakeLock?.isHeld == false) {
                 wakeLock?.acquire(10*60*1000L /*10 minutes*/)
            }
        } catch (e: SecurityException) {
            Log.e("AudioService", "WakeLock permission missing: ${e.message}")
        }

        connectWebSocket()
        sendBroadcastUpdate("Initializing AI...")
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
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                
                // --- Aggressive Continuous Listening Extras ---
                // Standard Constants
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 60000L)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 60000L)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 60000L)
                
                // Legacy String Keys (Critical for some devices)
                putExtra("android.speech.extras.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS", 60000L)
                putExtra("android.speech.extras.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS", 60000L)
                
                // Undocumented Google Extras
                putExtra("android.speech.extra.DICTATION_MODE", true)
                putExtra("android.speech.extra.PARTIAL_RESULTS", true)
            }

            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                // REMOVED: onReadyForSpeech and onBeginningOfSpeech broadcasts
                // These were causing the "Listening..." text to overwrite transcripts
                override fun onReadyForSpeech(params: Bundle?) {
                    // Only show "Listening..." if we have NO transcript yet
                    if (lastTranscript.isEmpty()) {
                        sendBroadcastUpdate("🎤 Listening...")
                    }
                }
                override fun onBeginningOfSpeech() {
                    // User started speaking - do nothing, transcript will appear via partials/results
                }
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                
                override fun onEndOfSpeech() {
                    // Processing - but don't overwrite transcript, just log
                    Log.d("AudioService", "End of speech detected")
                }

                override fun onError(error: Int) {
                    if (isListening) {
                         // 7 = No Match, 6 = Timeout - these are normal during silence
                        val isIgnorable = (error == 7 || error == 6)
                        if (!isIgnorable) {
                            Log.e("AudioService", "Real error: $error")
                            sendBroadcastUpdate("⚠️ Error: $error")
                        }
                        // Restart silently - don't touch UI
                        val delay = if (isIgnorable) 50L else 1000L 
                        handler.postDelayed({ safeStartListening() }, delay) 
                    }
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        sendTranscript(matches[0])
                    }
                    // Restart to catch next sentence
                    if (isListening) handler.postDelayed({ safeStartListening() }, 50)
                }

                override fun onPartialResults(partialResults: Bundle?) {
                     val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                     if (!matches.isNullOrEmpty()) {
                         // FIX: Use sendBroadcastUpdate which has setPackage()
                         sendBroadcastUpdate(matches[0] + "...")
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
            // 1. Force state clear (Cancel is faster than destroy)
            speechRecognizer?.cancel()
            
            // 2. Start immediately. The delay in onError/onResults is sufficient.
            // Extra delay here causes the "double beep" effect.
            try {
                speechRecognizer?.startListening(recognitionIntent)
            } catch (e: Exception) {
                 Log.e("AudioService", "Retry Start failed: ${e.message}")
                 // Only if start fails, we wait and retry
                 handler.postDelayed({ setupSpeechRecognition() }, 1000)
            }
            
        } catch (e: Exception) {
            Log.e("AudioService", "Start listening loop error: ${e.message}")
        }
    }

    private var threatsBlocked = 0
    private val heartbeatHandler = Handler(Looper.getMainLooper())
    private val heartbeatRunnable = object : Runnable {
        override fun run() {
            if (webSocket != null) {
                try {
                    val bm = getSystemService(BATTERY_SERVICE) as android.os.BatteryManager
                    val batLevel = bm.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY)
                    val deviceName = "${Build.MANUFACTURER} ${Build.MODEL}"
                    
                    val json = JSONObject().apply {
                        put("type", "REGISTER_DEVICE")
                        put("device_id", android.provider.Settings.Secure.getString(contentResolver, android.provider.Settings.Secure.ANDROID_ID))
                        put("device_name", deviceName)
                        put("battery", batLevel)
                        put("threats_blocked", threatsBlocked)
                    }
                    webSocket?.send(json.toString())
                } catch (e: Exception) {
                    Log.e("AudioService", "Heartbeat failed: ${e.message}")
                }
            }
            heartbeatHandler.postDelayed(this, 3000) // Send every 3 seconds
        }
    }

    private fun connectWebSocket() {
        // FIX: Reverting to 'server_url' because that is what the Settings Dialog saves to
        val baseUrl = getSharedPreferences("ShieldCallPrefs", Context.MODE_PRIVATE).getString("server_url", "http://192.168.1.100:8000") ?: "http://192.168.1.100:8000"
        
        // Convert HTTP/S to WS/S
        val wsUrl = when {
            baseUrl.startsWith("https://") -> baseUrl.replace("https://", "wss://")
            baseUrl.startsWith("http://") -> baseUrl.replace("http://", "ws://")
            else -> "ws://$baseUrl"
        }

        val request = Request.Builder().url("$wsUrl/ws/monitor").build()
        
        // Cancel logic if re-connecting
        // webSocket?.close(1000, "Reconnecting") 
        
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d("AudioService", "WebSocket Connected to $wsUrl")
                // Start Heartbeat
                heartbeatHandler.post(heartbeatRunnable)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    if (json.optString("type") == "NEW_THREAT") {
                        val risk = json.optInt("risk_score", 0)
                        val type = json.optString("scam_type", "Unknown")
                        if (risk > 70) {
                            threatsBlocked++
                            showThreatAlert(type, risk)
                        }
                    }
                } catch (e: Exception) {
                    Log.e("AudioService", "Message parse error: ${e.message}")
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("AudioService", "WebSocket Failure: ${t.message}")
                // Retry logic could go here, but client auto-reconnects on next activity launch usually.
                // For service, we might want a delayed retry.
            }
            
            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                 heartbeatHandler.removeCallbacks(heartbeatRunnable)
            }
             override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                 heartbeatHandler.removeCallbacks(heartbeatRunnable)
            }
        })
    }

    private fun sendBroadcastUpdate(status: String) {
        val intent = Intent("com.shieldcall.mobile.TRANSCRIPT")
        intent.setPackage(packageName) // CRITICAL: Explicit package for Android 13+ compatibility
        intent.putExtra("text", status)
        sendBroadcast(intent)
        Log.d("AudioService", "Broadcast sent: $status") // Debug log
    }

    private var lastTranscript = ""

    private fun sendTranscript(text: String) {
        val lower = text.lowercase()
        lastTranscript = text // Save for reference
        
        // 0. Broadcast to UI
        sendBroadcastUpdate(text)

        // 1. Send to Server
        val json = JSONObject().apply {
            put("type", "AUDIO_CHUNK")
            put("text", text)
        }
        webSocket?.send(json.toString())
        Log.d("AudioService", "Sent: $text")

        // 2. Client-Side Threat Detection (Matching PWA MobileClient keywords)
        val isBankThreat = lower.contains("bank") && 
                           (lower.contains("otp") || lower.contains("password") || lower.contains("account"))
        
        val isKycThreat = lower.contains("kyc") || lower.contains("verify") || lower.contains("aadhaar") ||
                          lower.contains("pan card") || lower.contains("link")
        
        val isLotteryThreat = lower.contains("lottery") || lower.contains("prize") || 
                              lower.contains("winner") || lower.contains("congratulations") ||
                              lower.contains("lakh") || lower.contains("crore")
        
        val isLegalThreat = lower.contains("police") || lower.contains("arrest") || 
                            lower.contains("customs") || lower.contains("court")
        
        val isUrgentThreat = lower.contains("urgent") || lower.contains("immediate") ||
                             lower.contains("blocked") || lower.contains("suspended")
        
        Log.d("AudioService", "Detection: bank=$isBankThreat kyc=$isKycThreat lottery=$isLotteryThreat legal=$isLegalThreat urgent=$isUrgentThreat")
        
        if (isBankThreat || isKycThreat || isLotteryThreat || isLegalThreat || isUrgentThreat) {
            val scamType = when {
                isBankThreat -> "Bank/OTP Fraud"
                isKycThreat -> "KYC Scam"
                isLotteryThreat -> "Lottery Scam"
                isLegalThreat -> "Legal Threat"
                else -> "Urgent Scam"
            }
            Log.w("AudioService", "⚠️ THREAT DETECTED: $scamType - Triggering alert!")
            threatsBlocked++
            showThreatAlert(scamType, 95)
        }
    }

    @SuppressLint("MissingPermission")
    private fun showThreatAlert(scamType: String, risk: Int) {
        Log.w("AudioService", "🚨 showThreatAlert CALLED with: $scamType")
        
        val channelId = "ShieldCallAlerts"
        
        // Create channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Threat Alerts", NotificationManager.IMPORTANCE_HIGH)
            channel.enableVibration(true)
            channel.vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 1000)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
            Log.d("AudioService", "Notification channel created")
        }
        
        // DIRECT VIBRATION (Fallback if notification doesn't vibrate)
        try {
            val vibrator = getSystemService(android.os.Vibrator::class.java)
            if (vibrator?.hasVibrator() == true) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(android.os.VibrationEffect.createWaveform(longArrayOf(0, 500, 200, 500, 200, 1000), -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(longArrayOf(0, 500, 200, 500, 200, 1000), -1)
                }
                Log.d("AudioService", "Direct vibration triggered")
            }
        } catch (e: Exception) {
            Log.e("AudioService", "Vibration failed: ${e.message}")
        }
        
        // Broadcast RED SCREEN to UI
        sendBroadcastUpdate("🚨 SCAM DETECTED: $scamType")
        
        // Launch FULL-SCREEN RED ALERT Activity
        val alertIntent = Intent(this, ThreatAlertActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("THREAT_TYPE", scamType)
        }
        startActivity(alertIntent)
        
        // Also send notification for when app is in background
        val notifIntent = Intent(this, ThreatAlertActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("THREAT_TYPE", scamType)
        }
        val pendingIntent = PendingIntent.getActivity(this, 1, notifIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("🚨 POTENTIAL SCAM DETECTED!")
            .setContentText("$scamType (Risk: $risk%)")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .setFullScreenIntent(pendingIntent, true)
            .setAutoCancel(true)
            .build()
            
        try {
            val notifManager = androidx.core.app.NotificationManagerCompat.from(this)
            if (notifManager.areNotificationsEnabled()) {
                notifManager.notify(System.currentTimeMillis().toInt(), notification)
                Log.d("AudioService", "Notification posted successfully")
            } else {
                Log.e("AudioService", "Notifications are DISABLED - user needs to enable them!")
            }
        } catch (e: Exception) {
            Log.e("AudioService", "Notify failed: ${e.message}")
        }
    }

    override fun onDestroy() {
        isListening = false
        if (wakeLock?.isHeld == true) wakeLock?.release()
        
        handler.post {
            speechRecognizer?.destroy()
        }
        heartbeatHandler.removeCallbacks(heartbeatRunnable)
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
