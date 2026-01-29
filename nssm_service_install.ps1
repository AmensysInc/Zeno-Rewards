# Install Zeno Rewards as Windows Service using NSSM
# Download NSSM from: https://nssm.cc/download

param(
    [string]$NSSMPath = "C:\nssm\nssm.exe",
    [string]$ProjectPath = $PSScriptRoot,
    [string]$ServiceName = "ZenoRewardsBackend"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Zeno Rewards as Windows Service" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if NSSM exists
if (-not (Test-Path $NSSMPath)) {
    Write-Host "ERROR: NSSM not found at: $NSSMPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download NSSM from: https://nssm.cc/download" -ForegroundColor Yellow
    Write-Host "Extract it and update the NSSMPath parameter." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host "  .\nssm_service_install.ps1 -NSSMPath 'C:\nssm\win64\nssm.exe'" -ForegroundColor White
    exit 1
}

# Check if service already exists
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Service '$ServiceName' already exists." -ForegroundColor Yellow
    $response = Read-Host "Remove existing service? (y/n)"
    if ($response -eq "y") {
        & $NSSMPath stop $ServiceName
        & $NSSMPath remove $ServiceName confirm
        Write-Host "Removed existing service." -ForegroundColor Green
    } else {
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Load environment variables from .env
$envVars = @()
if (Test-Path "$ProjectPath\.env") {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Cyan
    Get-Content "$ProjectPath\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars += "$key=$value"
        }
    }
} else {
    Write-Host "Warning: .env file not found. Using defaults." -ForegroundColor Yellow
    $envVars = @(
        "DATABASE_URL=sqlite:///./rewards.db",
        "SECRET_KEY=supersecretkeyhere",
        "ENVIRONMENT=production"
    )
}

Write-Host ""
Write-Host "Installing service..." -ForegroundColor Yellow

# Install service
& $NSSMPath install $ServiceName "$ProjectPath\venv\Scripts\python.exe" `
    "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"

# Set working directory
& $NSSMPath set $ServiceName AppDirectory "$ProjectPath"

# Set display name and description
& $NSSMPath set $ServiceName DisplayName "Zeno Rewards Backend"
& $NSSMPath set $ServiceName Description "Zeno Rewards System Backend API Server"

# Set startup type to automatic
& $NSSMPath set $ServiceName Start SERVICE_AUTO_START

# Set environment variables
foreach ($envVar in $envVars) {
    & $NSSMPath set $ServiceName AppEnvironmentExtra $envVar
}

# Set output redirection (optional, for logging)
$logDir = "$ProjectPath\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}
& $NSSMPath set $ServiceName AppStdout "$logDir\stdout.log"
& $NSSMPath set $ServiceName AppStderr "$logDir\stderr.log"

Write-Host ""
Write-Host "✓ Service installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Service Configuration:" -ForegroundColor Cyan
Write-Host "  Name: $ServiceName" -ForegroundColor White
Write-Host "  Display Name: Zeno Rewards Backend" -ForegroundColor White
Write-Host "  Working Directory: $ProjectPath" -ForegroundColor White
Write-Host "  Logs: $logDir" -ForegroundColor White
Write-Host ""
Write-Host "To start the service:" -ForegroundColor Yellow
Write-Host "  net start $ServiceName" -ForegroundColor White
Write-Host "  # or" -ForegroundColor Gray
Write-Host "  Start-Service $ServiceName" -ForegroundColor White
Write-Host ""
Write-Host "To stop the service:" -ForegroundColor Yellow
Write-Host "  net stop $ServiceName" -ForegroundColor White
Write-Host "  # or" -ForegroundColor Gray
Write-Host "  Stop-Service $ServiceName" -ForegroundColor White
Write-Host ""
Write-Host "To uninstall the service:" -ForegroundColor Yellow
Write-Host "  & '$NSSMPath' remove $ServiceName confirm" -ForegroundColor White

