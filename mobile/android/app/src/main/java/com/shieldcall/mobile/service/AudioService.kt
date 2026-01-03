package com.shieldcall.mobile.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

class AudioService : Service() {

    private var isRecording = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("ShieldCall", "Audio Monitoring Started")
        startMonitoring()
        return START_STICKY
    }

    private fun startMonitoring() {
        // Initialize Vosk or AudioRecord here
        isRecording = true
        Thread {
            while (isRecording) {
                // Mock listening loop
                // In real implementation: read byte buffer -> feed to model
                Thread.sleep(1000)
            }
        }.start()
    }

    override fun onDestroy() {
        isRecording = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
