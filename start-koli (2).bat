@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found in PATH.
  echo Install from https://nodejs.org or restart the PC after installing, then try again.
  pause
  exit /b 1
)
echo Starting Koli... A browser tab will open in a few seconds.
echo Close the server window to stop.
start "Koli — Vite" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173/"
