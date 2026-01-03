# 🎥 ShieldCall AI - Demo Video Script (2 Minutes)

**Target Audience**: Judges @ Byte Quest Hackathon
**Goal**: Show "Real-World" Application, Mobile Integration, and Community features.

---

### **0:00 - 0:20 | Introduction (The Hook)**
**[Scene: Face Camera or Title Slide]**
"Scams in India have evolved—but our protection hasn't. Fraudsters use psychological pressure, urgency, and fear. Introducing **ShieldCall AI**, a real-time, community-powered fraud defense ecosystem built for everyone, especially the elderly."

### **0:20 - 0:50 | The "Mobile" Sensor (The WoW Factor)**
**[Scene: Split Screen - Phone (Mobile Client Page) and Laptop (Dashboard)]**
"Unlike traditional apps that just block numbers, ShieldCall listens in real-time. Here, I have my phone connected as a sentinel."
*Action*: Show phone screen on `localhost:5173/mobile-client`.
"I'll simulate a Bank Fraud call."
*Action*: Click **'Simulate Bank Scam'** on phone.
*Action*: Point to Laptop Dashboard turning RED.
"As you can see, the moment the scammer asks for an OTP, the system flags it instantly on the global dashboard."

### **0:50 - 1:20 | The Command Center (Dashboard Tour)**
**[Scene: Screen Record Laptop Dashboard]**
"This is our **Mission Control**. It visualizes threats across the network."
1.  **Live Matrix**: "We can see the active threat I just generated here in the 'Live Threats' tab."
2.  **Risk Gauge**: "The global risk level increases dynamically."
3.  **Community Intel**: Navigate to `/community`.
    "We gamified safety. Users get XP and badges like 'Cyber Guardian' for confirming scam reports, building a crowdsourced blacklist that actually works."

### **1:20 - 1:45 | Tech Stack & Scalability**
**[Scene: Slide showing Tech Stack or Quick Code Scroll]**
"We built this using a **FastAPI** backend with WebSockets for sub-millisecond latency, and a **React** frontend. The mobile detection runs on-device using lightweight models to ensure privacy."

### **1:45 - 2:00 | Conclusion**
**[Scene: Face Camera]**
"ShieldCall AI isn't just an app; it's a nervous system against fraud. We are ready to deploy and save millions. Thank you."

---
**💡 Pro Tip for Recording:**
Use OBS Studio to record your screen and a small webcam overlay. Speak clearly and fast!
