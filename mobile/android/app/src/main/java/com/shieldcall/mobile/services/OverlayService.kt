package com.shieldcall.mobile.services

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import com.shieldcall.mobile.R // Assuming R exists in real project

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val riskType = intent?.getStringExtra("RISK_TYPE") ?: "UNKNOWN"
        showOverlay(riskType)
        return START_NOT_STICKY
    }

    private fun showOverlay(riskType: String) {
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        
        params.gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
        params.y = 100

        // In a real app, inflate an XML layout here
        // overlayView = LayoutInflater.from(this).inflate(R.layout.alert_overlay, null)
        
        // For source gen, we'll simulate the view creation programmatically if XML isn't there
        overlayView = TextView(this).apply {
            text = "⚠️ DANGER: $riskType DETECTED"
            textSize = 18f
            setPadding(20, 20, 20, 20)
            setBackgroundColor(0xFFFF0000.toInt()) // Red
            setTextColor(0xFFFFFFFF.toInt()) // White
        }

        try {
            windowManager.addView(overlayView, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
    }
}
