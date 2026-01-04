@echo off
echo ==========================================
echo    SHIELDCALL AI - NETWORK MODE
echo ==========================================

echo [1/2] Starting Backend (0.0.0.0:8000)...
start "ShieldCall Brain" cmd /k "cd backend && uvicorn main:app --port 8000 --host 0.0.0.0"

echo [2/2] Starting Dashboard (0.0.0.0)...
start "ShieldCall UI" cmd /k "cd dashboard && npm run dev -- --host"

echo ==========================================
echo    SYSTEM IS LIVE ON NETWORK!
echo    1. Find your Laptop IP (run 'ipconfig')
echo    2. Open http://YOUR_IP:5173/mobile-client on Phone
echo ==========================================
pause
