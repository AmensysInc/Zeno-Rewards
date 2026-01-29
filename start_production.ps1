# Production Startup Script for Windows VPS
# This script starts the backend server in production mode

param(
    [int]$Port = 8000,
    [int]$Workers = 4
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Zeno Rewards Backend (Production)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env file
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Cyan
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  $key = $value" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "Warning: .env file not found. Using default values." -ForegroundColor Yellow
    $env:DATABASE_URL = "sqlite:///./rewards.db"
    $env:SECRET_KEY = "supersecretkeyhere"
    $env:ENVIRONMENT = "production"
}

# Set defaults if not set
if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = "sqlite:///./rewards.db"
}
if (-not $env:SECRET_KEY) {
    Write-Host "ERROR: SECRET_KEY not set in .env file!" -ForegroundColor Red
    exit 1
}
if (-not $env:ENVIRONMENT) {
    $env:ENVIRONMENT = "production"
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Port: $Port" -ForegroundColor White
Write-Host "  Workers: $Workers" -ForegroundColor White
Write-Host "  Database: $env:DATABASE_URL" -ForegroundColor White
Write-Host "  Environment: $env:ENVIRONMENT" -ForegroundColor White
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: .\deploy_windows.ps1 -Action install" -ForegroundColor Yellow
    exit 1
}

# Check if port is available
$portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "Warning: Port $Port is already in use." -ForegroundColor Yellow
    $response = Read-Host "Kill existing process? (y/n)"
    if ($response -eq "y") {
        $process = $portInUse | Select-Object -ExpandProperty OwningProcess -Unique
        Stop-Process -Id $process -Force
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host ""

# Start uvicorn with production settings
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app `
    --host 0.0.0.0 `
    --port $Port `
    --workers $Workers `
    --log-level info `
    --access-log

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow

