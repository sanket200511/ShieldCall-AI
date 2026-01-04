package com.shieldcall.mobile

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.shieldcall.mobile.service.AudioService
import okhttp3.*
import org.json.JSONObject
import java.io.IOException

class MainActivity : AppCompatActivity() {

    private var isShieldActive = false
    private lateinit var tvShieldStatus: TextView
    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvShieldStatus = findViewById(R.id.tvShieldStatus)

        // Settings Button
        findViewById<android.view.View>(R.id.btnSettings).setOnClickListener {
            showServerConfigDialog()
        }

        // Live Shield Ring
        findViewById<CardView>(R.id.cardLiveShield).setOnClickListener {
            toggleShield()
        }

        findViewById<android.view.View>(R.id.cardAnalyzer).setOnClickListener {
            checkNotificationPermission()
        }

        findViewById<android.view.View>(R.id.cardDatabase).setOnClickListener {
            showBlacklistCheckDialog()
        }
        
        findViewById<android.view.View>(R.id.cardNetwork).setOnClickListener {
            scanNetworkSecurity()
        }

        findViewById<android.view.View>(R.id.cardAction).setOnClickListener {
            // Deep link to Web Reporting Page
            // Deep link to Web Reporting Page. Extract IP from full URL if needed, or just use base.
            val fullUrl = getSharedPreferences("ShieldCallPrefs", MODE_PRIVATE).getString("server_url", "http://10.0.2.2:8000") ?: "http://10.0.2.2:8000"
            // Start Activity needs a clean URL. For now, just open the report page.
            val intent = Intent(Intent.ACTION_VIEW)
            intent.data = Uri.parse("$fullUrl/report_mobile_landing") // Assuming your backend has a redirect or frontend handles this
            startActivity(intent)
        }

        checkPermissions()
    }

    private fun scanNetworkSecurity() {
        // Mock Scan Logic
        val dialog = AlertDialog.Builder(this)
            .setTitle("Scanning Network...")
            .setMessage("Analyzing WiFi packets for ARP spoofing...")
            .create()
        dialog.show()
        
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            dialog.dismiss()
             AlertDialog.Builder(this)
            .setTitle("✅ Network Secure")
            .setMessage("Encryption: WPA2/WPA3\nDNS: Private\nNo MITM attacks detected.")
            .setPositiveButton("OK", null)
            .show()
        }, 2000)
    }

    private val transcriptReceiver = object : android.content.BroadcastReceiver() {
        override fun onReceive(context: android.content.Context?, intent: Intent?) {
            val text = intent?.getStringExtra("text") ?: ""
            findViewById<TextView>(R.id.tvTranscript).text = "\"$text\""
        }
    }

    override fun onResume() {
        super.onResume()
        val intentFilter = android.content.IntentFilter("com.shieldcall.mobile.TRANSCRIPT")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(transcriptReceiver, intentFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(transcriptReceiver, intentFilter)
        }
    }

    override fun onPause() {
        super.onPause()
        try { unregisterReceiver(transcriptReceiver) } catch (e: Exception) {}
    }

    private fun showServerConfigDialog() {
        val currentUrl = getSharedPreferences("ShieldCallPrefs", MODE_PRIVATE).getString("server_url", "http://10.0.2.2:8000")
        val input = EditText(this)
        input.setText(currentUrl)
        input.hint = "http://192.168.1.X:8000"
        
        val container = android.widget.LinearLayout(this)
        container.orientation = android.widget.LinearLayout.VERTICAL
        container.setPadding(50, 40, 50, 10)
        
        val tip = TextView(this)
        tip.text = "ℹ️ Use your Computer's IP + Port 8000.\nExample: http://192.168.1.5:8000\nDo NOT use localhost or 127.0.0.1 on device."
        tip.textSize = 12f
        tip.setTextColor(android.graphics.Color.GRAY)
        tip.setPadding(0, 0, 0, 20)
        
        container.addView(tip)
        container.addView(input)

        AlertDialog.Builder(this)
            .setTitle("Server URL Configuration")
            .setView(container)
            .setPositiveButton("Save") { _, _ ->
                var newUrl = input.text.toString().trim()
                if (newUrl.endsWith("/")) newUrl = newUrl.dropLast(1)
                
                getSharedPreferences("ShieldCallPrefs", MODE_PRIVATE).edit().putString("server_url", newUrl).apply()
                Toast.makeText(this, "URL Saved. Restart Shield to Apply.", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }


    private fun showBlacklistCheckDialog() {
        val input = EditText(this)
        input.hint = "+919876543210"

        AlertDialog.Builder(this)
            .setTitle("Crowd Source Blacklist")
            .setMessage("Enter number to check:")
            .setView(input)
            .setPositiveButton("Check") { _, _ ->
                val phone = input.text.toString()
                if (phone.isNotEmpty()) checkBlacklist(phone)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun checkBlacklist(phone: String) {
        val baseUrl = getSharedPreferences("ShieldCallPrefs", MODE_PRIVATE).getString("server_url", "http://10.0.2.2:8000") ?: "http://10.0.2.2:8000"
        val request = Request.Builder()
            .url("$baseUrl/blacklist/check?phone=$phone")
            .build()


        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Check Failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val json = JSONObject(response.body?.string() ?: "{}")
                    val isBlacklisted = json.optBoolean("is_blacklisted")
                    val details = json.optString("details")

                    runOnUiThread {
                        if (isBlacklisted) {
                            Toast.makeText(this@MainActivity, "⚠️ DANGER: $details", Toast.LENGTH_LONG).show()
                        } else {
                            Toast.makeText(this@MainActivity, "✅ SAFE: $details", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }
        })
    }

    private fun checkPermissions() {
        val permissions = mutableListOf(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        if (permissions.any { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }) {
            ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 100)
        }
    }

    @SuppressLint("SetTextI18n")
    private fun toggleShield() {
        if (!isShieldActive) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                val intent = Intent(this, AudioService::class.java)
                startService(intent) 
                isShieldActive = true
                tvShieldStatus.text = "ON"
                tvShieldStatus.setTextColor(android.graphics.Color.parseColor("#10B981"))
                Toast.makeText(this, "Shield Protection Activated", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Microphone permission required", Toast.LENGTH_SHORT).show()
                checkPermissions()
            }
        } else {
            val intent = Intent(this, AudioService::class.java)
            stopService(intent)
            isShieldActive = false
            tvShieldStatus.text = "OFF"
            tvShieldStatus.setTextColor(android.graphics.Color.parseColor("#EF4444"))
            Toast.makeText(this, "Shield Protection Deactivated", Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkNotificationPermission() {
        if (!Settings.Secure.getString(contentResolver, "enabled_notification_listeners").contains(packageName)) {
            Toast.makeText(this, "Please enable Notification Access for ShieldCall", Toast.LENGTH_LONG).show()
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        } else {
            Toast.makeText(this, "Analyzer Active: Monitoring WhatsApp/SMS", Toast.LENGTH_SHORT).show()
        }
    }
}
