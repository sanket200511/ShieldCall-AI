# ShieldCall AI - Presentation Slides Content 📽️

**Instructions**: Copy-paste this content into PowerPoint or Canva to make your PDF.

---

## **Slide 1: Title Slide**
**Title**: ShieldCall AI
**Subtitle**: Real-Time Audio Fraud Detection Ecosystem
**Team Name**: [Your Team Name]
**Hackathon**: Byte Quest 2026
**Tagline**: "Silence the Scam. Protect the Vulnerable."

---

## **Slide 2: The Problem (Why This Matters)**
*   **Rising Threat**: Voice scams (Vishing) cost Indians ₹X Crores annually.
*   **Vulnerable Targets**: Elderly users and first-time internet adopters are easiest prey.
*   **The Gap**: Truecaller blocks numbers, but doesn't listen to *context*. Once you pick up, you are on your own.
*   **Key Insight**: Fraud happens in *real-time* conversation (Urgency, Fear, OTP requests). We need a solution that protects *during* the call.

---

## **Slide 3: Our Solution (ShieldCall AI)**
*   **Real-Time Audio Guard**: Runs locally on-device to detect keywords (OTP, Police, Bank, Arrest) using lightweight AI models.
*   **Smart Intervention**: Vibrates and alerts the user immediately if a "Fear Pattern" is detected.
*   **Community Powered**: Gamified reporting turns every user into a sensor for the network.
*   **Privacy First**: Audio is analyzed locally; only anonymized threat data is sent to the cloud.

---

## **Slide 4: Technical Architecture**
*   **Mobile (Sentinel)**: Android/Kotlin + Vosk ASR (Offline Speech-to-Text).
*   **Backend (Brain)**: Python FastAPI + WebSockets (for <100ms alerts).
*   **Frontend (Command Center)**: React + Tailwind + Recharts (for visualization).
*   **Database**: Supabase (PostgreSQL) for storing scam reputation scores.

---

## **Slide 5: Key Features (The "Wow")**
1.  **Live Threat Matrix**: Visualizes scam campaigns as they happen.
2.  **Web-Mobile Bridge**: Unique architecture allowing any device to act as a sensor via browser.
3.  **Gamified Intel**: Leaderboards and XP for users who report scams, keeping the community engaged.

---

## **Slide 6: Impact & Future Roadmap**
*   **Scalability**: Capable of handling 10,000+ concurrent nodes via Async Python.
*   **Future Plans**:
    *   Voice Biometrics to detect known scammers by voice print.
    *   Integration with Telecom APIs to auto-drop calls.
    *   Multi-language support (Hindi/Tamil/Telugu) for rural India.

---
**Footer for all slides**: ShieldCall AI - Byte Quest 2026
