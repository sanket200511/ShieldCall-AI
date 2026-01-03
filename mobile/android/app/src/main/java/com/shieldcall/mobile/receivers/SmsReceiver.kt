package com.shieldcall.mobile.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.originatingAddress
                val messageBody = sms.messageBody
                
                Log.d("ShieldCall", "SMS received from $sender: $messageBody")
                
                // TODO: Send to local TFLite model or regex checker
                checkForScam(context, sender, messageBody)
            }
        }
    }

    private fun checkForScam(context: Context, sender: String?, body: String) {
        val scamKeywords = listOf("lottery", "winner", "expiry", "kyc", "block", "refund")
        
        if (scamKeywords.any { body.contains(it, ignoreCase = true) }) {
            Log.w("ShieldCall", "POTENTIAL SCAM DETECTED")
            // Trigger OverlayService to warn user
            val intent = Intent(context, com.shieldcall.mobile.services.OverlayService::class.java)
            intent.putExtra("RISK_TYPE", "SMS_PHISHING")
            context.startService(intent)
        }
    }
}
