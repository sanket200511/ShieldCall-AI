# ShieldCall AI - Technical Documentation 📘

## 1. Project Overview
ShieldCall AI is a real-time fraud detection ecosystem designed to prevent voice and SMS scams. It utilizes a **Mobile-First** approach for detection and a **Centralized Dashboard** for monitoring.

## 2. System Architecture

### A. Mobile Client (Android)
*   **Language**: Kotlin
*   **Responsibilities**:
    *   **AudioService**: Captures call audio streams (requires `RECORD_AUDIO` permission).
    *   **Vosk ASR**: Performs offline Speech-to-Text on the device.
    *   **SmsReceiver**: Intercepts `SMS_RECEIVED` events.
    *   **OverlayService**: Draws alerts over other apps using `SYSTEM_ALERT_WINDOW`.

### B. Backend Server (FastAPI)
*   **Language**: Python 3.10+
*   **Framework**: FastAPI
*   **Key Files**:
    *   `backend/main.py`: Entry point.
*   **Endpoints**:
    *   `POST /report`: Accepts JSON reports of confirmed scams.
    *   `POST /analyze/text`: Returns a risk score (0-100) for a given text string.
    *   `WS /ws/monitor`: WebSocket endpoint for streaming live alerts to the dashboard.

### C. Web Dashboard (React)
*   **Framework**: Vite + React
*   **Styling**: Tailwind CSS
*   **Key Components**:
    *   `LiveFeed.jsx`: Listens to the `/ws/monitor` WebSocket.
    *   `RiskGauge.jsx`: Visualizes the global threat level.
    *   `Sidebar.jsx`: Main navigation.

## 3. Directory Structure
```
C:\VigilVoice\
├── backend/           # Python FastAPI Server
│   ├── main.py        # Application Logic
│   └── requirements.txt
├── dashboard/         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── mobile/            # Android Source Code
│   └── android/app/src/main/java/com/shieldcall/mobile/
│       ├── services/  # Audio & Overlay Services
│       └── receivers/ # SMS Receiver
└── README.md          # Project Entry Point
```

## 4. API Reference

### Analyze Text
**Endpoint**: `/analyze/text`
**Method**: `POST`
**Body**:
```json
{
  "text": "Your bank account will be blocked. Send OTP."
}
```
**Response**:
```json
{
  "risk_score": 85,
  "is_scam": true,
  "keywords": ["blocked", "otp"]
}
```

## 5. Deployment
*   **Backend**: Ready for Render/Railway. Ensure `uvicorn` is the start command.
*   **Frontend**: Ready for Vercel/Netlify. Build command: `npm run build`.
