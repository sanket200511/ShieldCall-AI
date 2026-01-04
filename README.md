# Byte Quest Hackathon Submission

**1. Problem Statement**: PS 11 - Real-Time Audio Fraud Detection for Scam Prevention  
**2. Project Name**: ShieldCall AI  
**3. Team Name**: Vibe Toh Hai  
**4. Deployed Link**: Not deployed (local demo available)  
**5. Demonstration Video**: [Watch Demo Video](https://drive.google.com/file/d/1kd7DRJchz4l-CZ5qZWfQBIySL7QFSzjI/view?usp=drive_link)  
**6. PPT Link**: [View Presentation (PDF)](https://drive.google.com/file/d/1HasRAs1MC97HqUN0sobOuLuBmRLG6PHK/view?usp=drive_link)

---

# ShieldCall AI 🛡️
### Real-Time AI Fraud Detection Ecosystem

**ShieldCall AI** protects vulnerable users (especially the elderly) from voice and SMS scams in real-time. It combines a mobile app for on-device detection with a powerful web dashboard for family/community monitoring.

## 🌟 Key Features

### 📱 Mobile App (Android)
- **Live Audio Monitor**: Real-time Speech-to-Text scam detection
- **Smart Overlays**: Full-screen red alerts when threats detected
- **SMS/WhatsApp Analyzer**: Scans incoming messages for scams
- **Crowdsourced Blacklist**: Check if a number is reported by the community
- **Network Audit**: WiFi security scanner

### 🌐 Web Dashboard
- **Live Threat Matrix**: Real-time feed of all detected threats
- **Device Manager**: Monitor all connected family devices
- **Community Blocklist**: View and report scam numbers
- **Cyber-Crime Reporter**: Generate official PDF complaints

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Python (FastAPI), WebSockets |
| Database | Supabase (PostgreSQL) / JSON files |
| Mobile | Native Android (Kotlin) |

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend
```bash
cd dashboard
npm install
npm run dev
```

### 3. Mobile App
1. Open `mobile/android` in Android Studio
2. Build APK: `Build > Build APK(s)`
3. Install on device
4. Tap ⚙️ Settings → Enter your Backend URL

## 📱 Usage

1. **Activate Shield**: Tap the central shield button on mobile app
2. **Speak**: Say scam-related words like "Bank OTP", "KYC verification"
3. **Alert**: Full-screen red alert + vibration triggers
4. **Monitor**: Family dashboard shows real-time threats

## 📄 License

MIT License - Built for Byte Quest Hackathon 2026
