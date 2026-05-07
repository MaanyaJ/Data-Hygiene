# Start all Micro Frontends
# Run this in the root directory: c:\Users\user\Desktop\data-hygiene

Write-Host "Starting Data Hygiene MFEs..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mfe-dashboard; npm install; npm run build; npm run preview"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mfe-details; npm install; npm run build; npm run preview"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mfe-shell; npm install; npm run build; npm run preview"

Write-Host "Apps are launching!" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:5001"
Write-Host "Details:   http://localhost:5002"
Write-Host "Host:      http://localhost:5000 (Main Entry)"
