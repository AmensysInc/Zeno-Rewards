# Restart Both Backend and Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESTARTING BACKEND AND FRONTEND" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Stop Backend
Write-Host "Stopping backend processes on port 8000..." -ForegroundColor Yellow
$backendProcesses = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($backendProcesses) {
    foreach ($procId in $backendProcesses) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped backend process (PID: $procId)" -ForegroundColor Green
        } catch {
            # Process might have already stopped
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No backend process found on port 8000" -ForegroundColor Gray
}

# Stop Frontend
Write-Host "`nStopping frontend processes on port 3000..." -ForegroundColor Yellow
$frontendProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($frontendProcesses) {
    foreach ($procId in $frontendProcesses) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped frontend process (PID: $procId)" -ForegroundColor Green
        } catch {
            # Process might have already stopped
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No frontend process found on port 3000" -ForegroundColor Gray
}

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Start Backend
Write-Host "`nStarting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\vijay\backend; `$env:DATABASE_URL='postgresql://admin:password@localhost:5432/rewards'; `$env:SECRET_KEY='supersecretkeyhere'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal

Write-Host "  Backend starting in new window..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`nStarting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\vijay\backend\frontend; Write-Host 'Starting Frontend Server...' -ForegroundColor Green; npm start" -WindowStyle Normal

Write-Host "  Frontend starting in new window...`n" -ForegroundColor Cyan

Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVERS STARTING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 10-15 seconds for both servers to fully start." -ForegroundColor Yellow
Write-Host "Then try creating an organization at: http://localhost:3000/create-org" -ForegroundColor White
Write-Host ""

