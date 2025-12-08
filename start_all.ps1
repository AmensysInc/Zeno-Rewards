# Start Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-File", "start_backend.ps1"

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-File", "start_frontend.ps1"

Write-Host "Backend and Frontend servers are starting in separate windows..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan

