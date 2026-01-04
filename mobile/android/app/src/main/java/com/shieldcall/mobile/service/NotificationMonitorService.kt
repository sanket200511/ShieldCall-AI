package com.shieldcall.mobile.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.core.app.NotificationCompat
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import com.shieldcall.mobile.R

class NotificationMonitorService : NotificationListenerService() {

    private val client = OkHttpClient()
    private val TARGET_PACKAGES = listOf("com.whatsapp", "com.android.mms", "com.google.android.apps.messaging")

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val packageName = sbn?.packageName ?: return
        
        if (packageName in TARGET_PACKAGES) {
            val extras = sbn.notification.extras
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()

            if (!text.isNullOrEmpty()) {
                Log.d("ShieldCallAnalyzer", "Intercepted from $packageName: $text")
                sendToBackend(text, packageName)
            }
        }
    }

    private fun sendToBackend(text: String, source: String) {
        val ip = getSharedPreferences("ShieldCallPrefs", MODE_PRIVATE).getString("server_ip", "10.0.2.2") ?: "10.0.2.2"
        val json = JSONObject().apply {
            put("text", text)
            put("source", source)
        }

        val request = Request.Builder()
            .url("http://$ip:8000/analyze/text")
            .post(RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json.toString()))
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

    private fun raiseAlert(source: String, verdict: String) {
        val channelId = "ShieldCallAnalyzerAlerts"
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Analyzer Alerts", NotificationManager.IMPORTANCE_HIGH)
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("⚠️ SCAM MSG DETECTED")
            .setContentText("Dangerous message detected in $source ($verdict)")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setAutoCancel(true)
            .build()

        manager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
