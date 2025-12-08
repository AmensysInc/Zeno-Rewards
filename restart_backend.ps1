# Restart Backend Script
Write-Host "Stopping existing backend processes..." -ForegroundColor Yellow

# Find and stop processes on port 8000
$processes = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process on port 8000 (PID: $pid)" -ForegroundColor Yellow
        } catch {
            # Process might have already stopped
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "`nStarting backend server..." -ForegroundColor Green

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Set environment variables
$env:DATABASE_URL = "postgresql://admin:password@localhost:5432/rewards"
$env:SECRET_KEY = "supersecretkeyhere"

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\vijay\backend; `$env:DATABASE_URL='postgresql://admin:password@localhost:5432/rewards'; `$env:SECRET_KEY='supersecretkeyhere'; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal

Write-Host "Backend server starting in a new window..." -ForegroundColor Cyan
Write-Host "Wait 5-10 seconds for it to fully start, then try creating an organization again." -ForegroundColor Yellow

