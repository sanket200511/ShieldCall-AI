# ShieldCall AI - User Manual 📖

## 1. Introduction
This manual explains how to use the **ShieldCall AI Command Center** to monitor and respond to fraud threats.

## 2. The Dashboard Interface
Once you launch the dashboard (via `start_project.bat`), you will see the **Mission Control** screen.

### A. Global Statistics
*   **Active Scams**: Number of threats currently being tracked.
*   **Global Threat Level**: A gauge showing the overall severity of current attacks.
    *   **Green**: Low Risk
    *   **Yellow**: Moderate Risk
    *   **Red**: Critical (Active Attack Campaign)

### B. Live Intercept Feed (Right Panel)
This panel updates in real-time.
*   **Incoming Alerts**: Appears dynamically when a user reports a scam or the AI detects one.
*   **Risk Score**: 0-100%. Scores above 70% are flagged as "Critical".
*   **Transcript**: A snippet of the suspicious text or audio.

### C. Map View (Center)
*(Visual Placeholder)* Represents the geographical distribution of calls. In a full deployment, this would show live heatmaps of scam call origins.

## 3. Managing Threats
1.  **Spot a Red Alert**: Look for alerts with red borders in the Live Feed.
2.  **Investigate**: Click the "Investigate" button (simulated) to view details.
3.  **Blacklist**: In a real scenario, admins can add the number to the global blacklist to block it for all users.

## 4. Mobile App Usage
1.  **Install**: (Requires building the APK from Android Studio).
2.  **Permissions**: Grant "Phone", "SMS", and "Overlay" permissions.
3.  **Automatic Protection**: The app runs in the background. If a scam call comes in, a **Red Warning Overlay** will appear on your phone screen.

## 5. Troubleshooting
*   **"Disconnected" Status**: Check if the Backend server window is open. The Dashboard needs the backend to receive live updates.
*   **No Alerts?**: The system uses mock data for the demo. Wait a few seconds, or refresh the page to see new "simulated" attacks.

## 6. Android 13+ Installation Guide (Important!) ⚠️
If you see a **"Restricted Setting"** popup when trying to enable Notification Access:
1.  This is a security feature for apps installed outside the Play Store.
2.  **To Fix It**:
    *   Open your phone's **Settings > Apps > ShieldCall AI**.
    *   Tap the **three dots** (⋮) in the top-right corner.
    *   Select **"Allow restricted settings"**.
    *   Verify your identity (fingerprint/PIN).
3.  Go back to the ShieldCall app and try enabling the permission again. It will now work!
