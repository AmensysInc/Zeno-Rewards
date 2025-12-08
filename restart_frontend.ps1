# Restart Frontend Script
Write-Host "Checking for Node.js..." -ForegroundColor Cyan

# Check if Node.js is installed
$nodePath = $null
$possiblePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $nodePath = $path
        Write-Host "Found Node.js at: $path" -ForegroundColor Green
        break
    }
}

# Try to find node in PATH
if (-not $nodePath) {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Host "Node.js found in PATH: $nodeVersion" -ForegroundColor Green
            $nodePath = "node"
        }
    } catch {
        # Node not in PATH
    }
}

if (-not $nodePath) {
    Write-Host "`n❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "`nPlease install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Install the LTS version" -ForegroundColor White
    Write-Host "3. Make sure to check 'Add to PATH' during installation" -ForegroundColor White
    Write-Host "4. Restart PowerShell after installation" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    exit 1
}

# Navigate to frontend directory
Set-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    "REACT_APP_API_URL=http://localhost:8000" | Out-File -FilePath ".env" -Encoding utf8
}

# Kill any existing processes on port 3000
Write-Host "`nChecking for existing frontend processes..." -ForegroundColor Cyan
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process on port 3000 (PID: $pid)" -ForegroundColor Yellow
        } catch {
            # Process might have already stopped
        }
    }
    Start-Sleep -Seconds 2
}

# Start the frontend
Write-Host "`nStarting frontend server..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm start

