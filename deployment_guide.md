# ShieldCall AI Software Deployment Guide

This guide covers how to deploy the entire ShieldCall AI system (Backend, Web Dashboard, and Mobile App) for production usage.

## 🏗️ Architecture Overview
1.  **Backend (Python/FastAPI)**: Handles logic, text analysis, and WebSocket connections.
2.  **Frontend (React/Vite)**: The admin dashboard for monitoring threats.
3.  **Mobile App (Android)**: The client that runs on phones, listens to audio, and reports threats.

---

## 🚀 Part 1: Deploying the Backend (FastAPI)
You need a cloud provider that supports Python and WebSockets. **Railway** or **Render** are recommended.

### Option A: Deploy on Railway (Recommended)
1.  Push your code to GitHub.
2.  Login to [Railway.app](https://railway.app/).
3.  Click **New Project** > **Deploy from GitHub repo**.
4.  Select your repository.
5.  **Variables**: Add the following Environment Variables in the Railway Dashboard:
    *   `SUPABASE_URL`: (Your Supabase URL)
    *   `SUPABASE_KEY`: (Your Supabase Key)
    *   `PORT`: `8000` (Railway usually auto-detects, but good to set)
6.  **Start Command**: Railway usually detects `Procfile` or `requirements.txt`. If asked, use:
    ```bash
    uvicorn backend.main:app --host 0.0.0.0 --port 8000
    ```
7.  Once deployed, Railway will give you a domain like: `https://shieldcall-backend-production.up.railway.app`
    *   **Copy this URL**. This is your **Backend URL**.

---

## 🌐 Part 2: Deploying the Dashboard (React)
We will use **Vercel** for the frontend.

1.  Login to [Vercel.com](https://vercel.com/).
2.  Click **Add New** > **Project**.
3.  Import your GitHub repository.
4.  **Build Settings**:
    *   Framework Preset: `Vite`
    *   Root Directory: `dashboard` (Important! Current setting is root, change to `dashboard`)
5.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: `https://shieldcall-backend-production.up.railway.app` (The URL from Part 1)
6.  Click **Deploy**.
7.  Vercel will give you a domain like: `https://shieldcall-dashboard.vercel.app`.

---

## 📱 Part 3: Building & Configuring the Mobile App
Now that your server is online, you need to point the app to it.

1.  **Build the APK**:
    *   Open Android Studio.
    *   Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    *   Locate the `app-debug.apk`.

2.  **Install on Phone**:
    *   Transfer the APK to your Android device and install it.

3.  **Connect to Cloud Server**:
    *   Open the ShieldCall App.
    *   Tap the **Settings Icon** (Top Right).
    *   **Server URL Configuration**:
        *   Enter the Railway URL from Part 1: `https://shieldcall-backend-production.up.railway.app`
        *   (Do **NOT** add `/` at the end).
    *   Click **Save**.

4.  **Permissions**:
    *   Grant Microphone and Notification permissions.
    *   **Important**: Allow "Restricted Settings" if prompted for Notification Access.

---

## ✅ Verification Checklist
1.  **Web Dashboard**: Open the Vercel link. Go to the "Settings" page. Verify that "API Endpoint" shows your Railway URL, not `localhost`.
2.  **Mobile App**: Click "Activate". Speak "OTP" or "Bank".
3.  **Result**:
    *   The Mobile App should vibrate and show a Red Alert.
    *   The Web Dashboard "Live Threats" page should immediately show the alert.

**Success! Your product is now live and accessible from anywhere in the world.** 🌍🚀
