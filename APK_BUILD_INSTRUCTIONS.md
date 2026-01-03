# How to Convert ShieldCall to a Real Android App (APK) 📱

You have built a powerful React Web App. Now, let's turn it into a native Android app that you can install on your phone. We will use **CapacitorJS**, which wraps your React code in a native container.

## Prerequisites
1.  **Node.js** installed (You have this).
2.  **Android Studio** installed (Required to build the APK).
3.  **Java/JDK** installed.

## Step 1: Initialize Capacitor in your Dashboard
Open your terminal in `C:\VigilVoice\dashboard` and run:

```powershell
# Install Capacitor core
npm install @capacitor/core
npm install @capacitor/cli --save-dev

# Initialize Capacitor (App Name: ShieldCall, ID: com.shieldcall.app)
npx cap init ShieldCall com.shieldcall.app
```

## Step 2: Add Android Platform
```powershell
# Install Android platform
npm install @capacitor/android

# Add specific Android folder
npx cap add android
```

## Step 3: Build your React App
Capacitor works with your *built* files (in the `dist` folder), not the dev server.
```powershell
# Build your React project
npm run build

# Sync the build folder to the Android project
npx cap sync
```

## Step 4: Open in Android Studio & Build APK
```powershell
# Open Android Studio
npx cap open android
```
1.  Wait for Android Studio to index the project.
2.  Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3.  Once done, transfer the `.apk` file to your phone and install it!

## Step 5: Adding Native Permissions (Optional)
To access real SMS/Call Logs, you need to install community plugins.
*Example for SMS:*
```powershell
npm install capacitor-sms-retriever
npx cap sync
```
*Then update `AndroidManifest.xml` in Android Studio to include `<uses-permission android:name="android.permission.READ_SMS" />`*
