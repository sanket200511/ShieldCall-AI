package com.shieldcall.mobile

import android.os.Bundle
import android.view.WindowManager
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class ThreatAlertActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Make this a full-screen urgent alert that appears over lock screen
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
        
        setContentView(R.layout.activity_threat_alert)
        
        // Get threat info from intent
        val scamType = intent.getStringExtra("THREAT_TYPE") ?: "POTENTIAL SCAM"
        
        // Set the scam type
        findViewById<TextView>(R.id.tvScamType).text = scamType
        
        // Tap anywhere to dismiss
        findViewById<android.view.View>(R.id.alertContainer).setOnClickListener {
            finish()
        }
    }
    
    override fun onBackPressed() {
        super.onBackPressed()
        finish()
    }
}
