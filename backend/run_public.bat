@echo off
echo Starting ShieldCall Backend (Public Access)...
echo This allows mobile devices to connect via WiFi.
cd /d "%~dp0"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
