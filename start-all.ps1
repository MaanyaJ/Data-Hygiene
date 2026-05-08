# Start all Micro Frontends
# Run this in the root directory: c:\Users\user\Desktop\data-hygiene

Write-Host "Starting Data Hygiene MFEs..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mfe-dashboard; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mfe-details; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mfe-shell; npm run dev"

Write-Host "Apps are launching!" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:5001"
Write-Host "Details:   http://localhost:5002"
Write-Host "Host:      http://localhost:5003 (Main Entry)"
