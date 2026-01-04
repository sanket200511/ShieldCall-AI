# Byte Quest Hackathon Submission

**1. Problem Statement**: PS 11 : Real-Time Audio Fraud Detection for Scam Prevention
**2. Project Name**: ShieldCall AI
**3. Team Name**: Vibe Toh Hai
**4. Deployed Link**: [Link to Deployment if available, else standard localhost]
**5. Demonstration Video**: [PASTE YOUR VIDEO LINK HERE]
**6. PPT Link**: [PASTE YOUR PPT DRIVE LINK HERE]

---

# ShieldCall AI 🛡️
### Real-Time AI Fraud Detection Ecosystem

**ShieldCall AI** is a comprehensive solution designed to protect vulnerable users (especially the elderly) from voice and SMS scams in real-time. It combines a mobile app for on-device detection with a powerful web dashboard for family/community monitoring.

## 🌟 Key Features

### 📱 Mobile App (Android)
- **Live Audio Monitor**: Real-time Speech-to-Text detection of scam keywords (e.g., "OTP", "Bank", "Police") using native Android Speech Recognition.
- **Smart Overlays**: Immediate visual alerts ("DANGER") during calls if suspicious patterns are detected.
- **SMS/WhatsApp Analyzer**: Scans incoming messages for phishing links and scam patterns using keyword analysis.
- **Network Audit**: Scans WiFi connection for security vulnerabilities.
- **Crowdsourced Blacklist**: One-tap check to verify if a number is reported by the community.

### 🌐 Web Dashboard (Command Center)
- **Live Threat Matrix**: Real-time full-screen feed of threats detected on connected mobile devices.
- **Device Manager**: Monitor connectivity, battery, and status of all family devices.
- **Community Intel**: View the global blacklist and manually report new numbers.
- **Cyber-Crime Reporter**: Generate official PDF complaints for legal action.

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion (Glassmorphism UI)
- **Backend**: Python (FastAPI), WebSockets (Real-time Streaming)
- **Database**: Supabase (PostgreSQL) for Reports & Blacklist
- **Mobile**: Native Android (Kotlin), SpeechRecognizer, OkHttp

## 🚀 Setup & Installation

### Backend
1. Navigate to `/backend`
2. Configure `.env` with `SUPABASE_URL` and `SUPABASE_KEY`
3. Install dependencies: `pip install -r requirements.txt`
4. Run server: `uvicorn main:app --reload --host 0.0.0.0` (Port 8000)

### Frontend (Dashboard)
1. Navigate to `/dashboard`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (Port 5173)

### Mobile App
1. Open `/mobile/android` in Android Studio.
2. Build APK via `Build > Build Bundle(s) / APK(s) > Build APK`.
3. Install on physical device.
4. **Configuration**: Tap Settings Icon -> Enter Backend URL (e.g., `https://your-app.railway.app` or `http://192.168.1.5:8000`).
5. Grant Permissions (Mic, Notifications).

## 📸 Usage
1. **Connect**: Ensure Dashboard and Mobile App are pointing to the same Backend.
2. **Activate**: Tap "Shield" on Phone. Speak keywords like "OTP" or "Bank".
3. **Monitor**: Watch the "Live Threat Matrix" on the Web Dashboard light up physically.

## 📄 Deployment
See the [Deployment Guide](deployment_guide.md) for step-by-step instructions on hosting this project on Railway (Backend) and Vercel (Frontend).
