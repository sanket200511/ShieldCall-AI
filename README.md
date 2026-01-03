# Byte Quest Hackathon Submission

**1. Problem Statement**: PS 11 - Real-Time Audio Fraud Detection for Scam Prevention
**2. Project Name**: ShieldCall AI
**3. Team Name**: Vibe Toh Hai
**4. Deployed Link**: 
**5. Demonstration Video**: 
**6. PPT Link**: 

---

# ShieldCall AI 🛡️

**A Real-Time AI Fraud Detection Ecosystem**

ShieldCall AI is a comprehensive solution designed to protect vulnerable users (especially the elderly) from voice and SMS scams in real-time. It combines a mobile app for on-device detection with a powerful web dashboard for community monitoring and reporting.

## 🌟 Key Features

### 📱 Mobile App (Android)
- **Live Audio Monitor**: Detects scam keywords (OTP, Bank, Police) locally using Vosk ASR.
- **Smart Overlays**: Alerts users *during* the call if suspicious patterns are detected.
- **SMS Analyzer**: Scans incoming messages for phishing links and scam patterns.
- **Elderly Mode**: Simplified UI with vibration alerts/trusted contact redirection.

### 🌐 Web Dashboard (Command Center)
- **Live Threat Map**: Real-time visualization of reported scams.
- **Community Consensus**: Blacklist numbers based on crowd-sourced reports.
- **Scam Analytics**: detailed breakdown of scam trends and tactics.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Python (FastAPI), WebSockets
- **Database**: Supabase (PostgreSQL)
- **Mobile**: Kotlin (Native Android - Source Code Provided)
- **AI/ML**: Vosk (Offline ASR), Silero VAD, Scikit-learn (Fraud Scoring)

## 🚀 Setup & Installation

### Backend
1. Navigate to `/backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `uvicorn main:app --reload`

### Dashboard
1. Navigate to `/dashboard`
2. Install dependencies: `npm install`
3. Run local dev server: `npm run dev`

### Mobile
1. Open `/mobile` in Android Studio.
2. Build and run on a physical device/emulator.

## 📸 Screenshots

