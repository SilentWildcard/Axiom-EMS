Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "    ERS - EMERGENCY RESPONSE SYNCHRONIZATION SYSTEM (DELHI, INDIA)" -ForegroundColor White
Write-Host "          AI/ML + IoT Roadside Infrastructure Coordination Grid" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
Write-Host "[*] Launching Backend Server on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000"

Write-Host "[*] Launching Frontend Server on http://127.0.0.1:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run preview -- --port 5173 --host 127.0.0.1"

Start-Sleep -Seconds 3

Write-Host "[*] Opening ERS in default web browser..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5173"

Write-Host "`nERS is running!" -ForegroundColor Green
