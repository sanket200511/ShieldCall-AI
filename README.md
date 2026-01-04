# ShieldCall AI 🛡️
### Real-Time AI Fraud Detection Ecosystem

**Problem Statement**: PS 11 - Real-Time Audio Fraud Detection for Scam Prevention  
**Team**: Vibe Toh Hai  
**Event**: Byte Quest Hackathon 2025

---

## 🌟 Overview

**ShieldCall AI** protects vulnerable users (especially the elderly) from voice and SMS scams in real-time. It combines a mobile app for on-device detection with a powerful web dashboard for family/community monitoring.

## 🎯 Key Features

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
| Database | Supabase (PostgreSQL) or JSON files |
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
4. Tap ⚙️ Settings → Enter your Backend URL (e.g., `http://YOUR_PC_IP:8000`)

## ⚙️ Configuration

### Environment Variables

**Backend** (`.env` in `/backend`):
```env
SUPABASE_URL=your_supabase_url  # Optional - uses JSON files if not set
SUPABASE_KEY=your_supabase_key
```

**Frontend**: Uses dynamic URL detection. Set `VITE_API_URL` in `.env` for hosted deployment.

**Mobile**: Configure via Settings dialog in app (saved to SharedPreferences).

## 📁 Data Storage

Without Supabase, the backend uses local JSON files:
- `backend/data/blacklist.json` - Community blocklist
- `backend/data/threats.json` - Detected threat history

## 🔗 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /stats` | Dashboard statistics |
| `GET /devices` | Connected devices list |
| `GET /threats/recent` | Recent threat history |
| `GET /blacklist/list` | Community blocklist |
| `GET /blacklist/check?phone=X` | Check if number is blacklisted |
| `POST /blacklist/report` | Report a scam number |
| `POST /analyze/text` | Analyze text for scam patterns |
| `POST /report/generate` | Generate PDF complaint |
| `WS /ws/monitor` | WebSocket for real-time updates |

## 📱 Mobile App Usage

1. **Activate Shield**: Tap the central shield button
2. **Speak**: Say scam-related words like:
   - "Bank account OTP"
   - "KYC verification"
   - "Lottery winner"
   - "Police arrest"
3. **Alert Triggers**: Full-screen red alert + vibration
4. **Check Blacklist**: Tap "Lookup" to verify any phone number

## 🌐 Deployment

See [deployment_guide.md](deployment_guide.md) for hosting on:
- **Railway** (Backend)
- **Vercel** (Frontend)
- **Play Store** (Mobile APK)

## 📄 License

MIT License - Built for Byte Quest Hackathon 2025
