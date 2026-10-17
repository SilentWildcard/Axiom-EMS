@echo off
title ERS — Emergency Response Synchronization System (Delhi)
color 0B

echo ===============================================================================
echo     ERS - EMERGENCY RESPONSE SYNCHRONIZATION SYSTEM (DELHI, INDIA)
echo           AI/ML + IoT Roadside Infrastructure Coordination Grid
echo ===============================================================================
echo.
echo [*] Checking local runtimes...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3 is not found on your PATH. Please install Python 3.10+.
    pause
    exit /b
)

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your PATH. Please install Node.js 18+.
    pause
    exit /b
)

echo [OK] Python and Node.js detected.
echo.
echo [*] 1/2 Launching FastAPI AI/ML Backend Server on http://127.0.0.1:8000 ...
start "ERS Backend (FastAPI + Scikit-Learn)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo [*] 2/2 Launching Frontend Application on http://127.0.0.1:5173 ...
start "ERS Frontend (React + Vite)" cmd /k "cd /d "%~dp0frontend" && npm run preview -- --port 5173 --host 127.0.0.1"

echo.
echo [*] Waiting 3 seconds for services to initialize...
timeout /t 3 >nul

echo [*] Launching ERS Command Center in your default web browser...
start http://127.0.0.1:5173

echo.
echo ===============================================================================
echo     SUCCESS! ERS IS NOW OPERATIONAL:
echo     - Frontend Dashboard:    http://127.0.0.1:5173
echo     - Backend API Docs:      http://127.0.0.1:8000/docs
echo     - WebSocket Telemetry:   ws://127.0.0.1:8000/ws/telemetry
echo.
echo     Keep this terminal open, or minimize the two server windows.
echo     Press any key to close this launcher window.
echo ===============================================================================
pause >nul
