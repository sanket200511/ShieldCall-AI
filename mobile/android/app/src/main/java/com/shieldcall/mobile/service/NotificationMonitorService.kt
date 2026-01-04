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

class NotificationMonitorService : NotificationListenerService() {

    private val client = OkHttpClient()
    private val targetPackages = listOf("com.whatsapp", "com.android.mms", "com.google.android.apps.messaging")

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val packageName = sbn?.packageName ?: return
        
        if (packageName in targetPackages) {
            val extras = sbn.notification.extras
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()

            if (!text.isNullOrEmpty()) {
                Log.d("ShieldCallAnalyzer", "Intercepted from $packageName: $text")
                sendToBackend(text, packageName)
            }
        }
    }

    private fun sendToBackend(text: String, source: String) {
        val baseUrl = getSharedPreferences("ShieldCallPrefs", MODE_PRIVATE).getString("server_url", "http://10.0.2.2:8000") ?: "http://10.0.2.2:8000"
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
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val respBody = response.body?.string()
                    val respJson = JSONObject(respBody ?: "{}")
                    
                    val risk = respJson.optInt("risk_score", 0)
                    val verdict = respJson.optString("verdict")
                    
                    if (risk > 70) {
                        raiseAlert(source, verdict)
                    }
                }
            }
        })
    }

    @SuppressLint("MissingPermission")
    private fun raiseAlert(source: String, verdict: String) {
        val channelId = "ShieldCallAnalyzerAlerts"
        
        // Create Notification Channel for Android O+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Analyzer Alerts"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, name, importance)
            val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("⚠️ SCAM MSG DETECTED")
            .setContentText("Dangerous message detected in $source ($verdict)")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setAutoCancel(true)
            .build()
            
        // Explicit Permission Check for Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
             if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                 Log.e("ShieldCall", "Missing POST_NOTIFICATIONS permission")
                 return
             }
        }

        // Use Compat Manager for reliability
        try {
            NotificationManagerCompat.from(this).notify(System.currentTimeMillis().toInt(), notification)
        } catch (e: Exception) {
            Log.e("ShieldCall", "Failed to post notification: ${e.message}")
        }
    }
}
