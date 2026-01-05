package com.shieldcall.mobile.service

import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import com.shieldcall.mobile.R
import com.shieldcall.mobile.ThreatAlertActivity
import android.content.Intent

class NotificationMonitorService : NotificationListenerService() {

    private val client = OkHttpClient()
    private val targetPackages = listOf("com.whatsapp", "com.android.mms", "com.google.android.apps.messaging")

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val packageName = sbn?.packageName ?: return
        
        if (packageName in targetPackages) {
            val extras = sbn.notification.extras
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()

            if (!text.isNullOrEmpty()) {
                Log.d("ShieldCallAnalyzer", "📩 Intercepted from $packageName: $text")
                
                // IMMEDIATE local check for faster response
                val lower = text.lowercase()
                val scamKeywords = listOf("lottery", "prize", "won", "winner", "congratulations", "lakh", "crore",
                    "bank", "otp", "kyc", "account", "verify", "urgent", "blocked", "suspend", "claim")
                
                val matches = scamKeywords.filter { lower.contains(it) }
                Log.d("ShieldCallAnalyzer", "🔍 Keywords found: $matches")
                
                if (matches.isNotEmpty()) {
                    Log.w("ShieldCallAnalyzer", "🚨 SCAM DETECTED! Keywords: $matches")
                    raiseAlert(packageName, "Suspicious: ${matches.joinToString()}")
                }
                
                // Also send to backend for analysis
                sendToBackend(text, packageName)
            }
        }
    }

    private fun sendToBackend(text: String, source: String) {
        val baseUrl = getSharedPreferences("ShieldCallPrefs", MODE_PRIVATE).getString("server_url", "http://192.168.1.100:8000") ?: "http://192.168.1.100:8000"
        val json = JSONObject().apply {
            put("text", text)
            put("source", source)
        }

        val request = Request.Builder()
            .url("$baseUrl/analyze/text")
            .post(json.toString().toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull()))
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("SmsAnalyzer", "Failed to send: ${e.message}")
                // Fallback: do local keyword check if backend fails
                checkLocalKeywords(text, source)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val respBody = response.body?.string()
                    val respJson = JSONObject(respBody ?: "{}")
                    
                    val risk = respJson.optInt("risk_score", 0)
                    val verdict = respJson.optString("verdict")
                    
                    Log.d("SmsAnalyzer", "Risk: $risk, Verdict: $verdict")
                    
                    // Lower threshold to 50 for better detection
                    if (risk > 50) {
                        raiseAlert(source, verdict)
                    }
                }
            }
        })
    }
    
    private fun checkLocalKeywords(text: String, source: String) {
        val lower = text.lowercase()
        val scamKeywords = listOf("lottery", "prize", "won", "winner", "congratulations", "lakh", "crore",
            "bank", "otp", "kyc", "account", "verify", "urgent", "blocked", "suspend", "claim")
        
        val matches = scamKeywords.filter { lower.contains(it) }
        if (matches.isNotEmpty()) {
            Log.w("SmsAnalyzer", "Local scam detected: $matches")
            raiseAlert(source, "Suspicious keywords: ${matches.joinToString()}")
        }
    }

    @SuppressLint("MissingPermission")
    private fun raiseAlert(source: String, verdict: String) {
        Log.d("ShieldCallAnalyzer", "🔔 raiseAlert called: $verdict")
        
        // LAUNCH FULL-SCREEN RED ALERT (same as voice detection)
        try {
            val alertIntent = Intent(this, ThreatAlertActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("THREAT_TYPE", "SMS/WhatsApp Scam: $verdict")
            }
            startActivity(alertIntent)
            Log.d("ShieldCallAnalyzer", "🚨 ThreatAlertActivity launched!")
        } catch (e: Exception) {
            Log.e("ShieldCallAnalyzer", "❌ Failed to launch alert: ${e.message}")
        }
        
        // Also post notification as backup
        val channelId = "ShieldCallAnalyzerAlerts"
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Analyzer Alerts"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, name, importance).apply {
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500)
            }
            val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("⚠️ SCAM MSG DETECTED")
            .setContentText("Dangerous message detected in $source ($verdict)")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .setAutoCancel(true)
            .build()

        try {
            val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            manager.notify(System.currentTimeMillis().toInt(), notification)
        } catch (e: Exception) {
            Log.e("ShieldCallAnalyzer", "Notification failed: ${e.message}")
        }
    }
}
