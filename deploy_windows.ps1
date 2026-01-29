# Windows VPS Deployment Script
# Run this script on your Windows VPS to set up and deploy the application

param(
    [string]$Action = "install",  # install, update, start, stop, restart
    [string]$ProjectPath = $PSScriptRoot
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Zeno Rewards - Windows VPS Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Warning: Not running as Administrator. Some operations may fail." -ForegroundColor Yellow
}

function Install-Dependencies {
    Write-Host "Step 1: Installing Python dependencies..." -ForegroundColor Yellow
    
    if (-not (Test-Path "$ProjectPath\venv")) {
        Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
        python -m venv venv
    }
    
    Write-Host "Activating virtual environment and installing packages..." -ForegroundColor Cyan
    & "$ProjectPath\venv\Scripts\Activate.ps1"
    pip install --upgrade pip
    pip install -r requirements.txt
    
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
}

function Install-FrontendDependencies {
    Write-Host "Step 2: Installing frontend dependencies..." -ForegroundColor Yellow
    
    Push-Location "$ProjectPath\frontend"
    if (-not (Test-Path "node_modules")) {
        npm install
    } else {
        npm install
    }
    Pop-Location
    
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
}

function Build-Frontend {
    Write-Host "Step 3: Building frontend for production..." -ForegroundColor Yellow
    
    Push-Location "$ProjectPath\frontend"
    
    # Create .env.production file if it doesn't exist
    if (-not (Test-Path ".env.production")) {
        $apiUrl = Read-Host "Enter your backend API URL (e.g., http://your-domain.com:8000)"
        "VITE_API_URL=$apiUrl" | Out-File -FilePath ".env.production" -Encoding utf8
    }
    
    npm run build
    
    Pop-Location
    
    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
}

function Setup-Environment {
    Write-Host "Step 4: Setting up environment variables..." -ForegroundColor Yellow
    
    if (-not (Test-Path "$ProjectPath\.env")) {
        Write-Host "Creating .env file from template..." -ForegroundColor Cyan
        Copy-Item "$ProjectPath\env.example" "$ProjectPath\.env" -ErrorAction SilentlyContinue
        
        if (-not (Test-Path "$ProjectPath\.env")) {
            Write-Host "Creating default .env file..." -ForegroundColor Cyan
            @"
DATABASE_URL=sqlite:///./rewards.db
SECRET_KEY=CHANGE-THIS-TO-A-SECURE-RANDOM-STRING-MIN-32-CHARACTERS
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
ENVIRONMENT=production
"@ | Out-File -FilePath "$ProjectPath\.env" -Encoding utf8
        }
        
        Write-Host "⚠ IMPORTANT: Please edit .env file and update all configuration values!" -ForegroundColor Red
        Write-Host "  - Set a strong SECRET_KEY" -ForegroundColor Yellow
        Write-Host "  - Update FRONTEND_URL and BACKEND_URL with your domain" -ForegroundColor Yellow
        Write-Host "  - Configure SMTP settings for email functionality" -ForegroundColor Yellow
    } else {
        Write-Host "✓ .env file already exists" -ForegroundColor Green
    }
}

function Initialize-Database {
    Write-Host "Step 5: Initializing database..." -ForegroundColor Yellow
    
    & "$ProjectPath\venv\Scripts\python.exe" -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
    
    Write-Host "✓ Database initialized" -ForegroundColor Green
}

function Start-Services {
    Write-Host "Step 6: Starting services..." -ForegroundColor Yellow
    
    # Kill existing processes
    Get-Process | Where-Object {$_.ProcessName -eq "python" -and $_.CommandLine -like "*uvicorn*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Start backend
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    $env:DATABASE_URL = (Get-Content "$ProjectPath\.env" | Select-String "DATABASE_URL").ToString().Split("=")[1].Trim()
    $env:SECRET_KEY = (Get-Content "$ProjectPath\.env" | Select-String "SECRET_KEY").ToString().Split("=")[1].Trim()
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectPath'; `$env:DATABASE_URL = '$($env:DATABASE_URL)'; `$env:SECRET_KEY = '$($env:SECRET_KEY)'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"
    
    Write-Host "✓ Services started" -ForegroundColor Green
    Write-Host "  Backend: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
}

function Stop-Services {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    
    Get-Process | Where-Object {$_.ProcessName -eq "python" -and $_.CommandLine -like "*uvicorn*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✓ Services stopped" -ForegroundColor Green
}

function Update-Application {
    Write-Host "Updating application..." -ForegroundColor Yellow
    
    # Pull latest code (if using git)
    if (Test-Path "$ProjectPath\.git") {
        Write-Host "Pulling latest code..." -ForegroundColor Cyan
        git pull
    }
    
    # Reinstall dependencies
    Install-Dependencies
    Install-FrontendDependencies
    
    # Rebuild frontend
    Build-Frontend
    
    # Restart services
    Stop-Services
    Start-Sleep -Seconds 2
    Start-Services
    
    Write-Host "✓ Application updated" -ForegroundColor Green
}

# Main execution
Set-Location $ProjectPath

switch ($Action.ToLower()) {
    "install" {
        Write-Host "Running full installation..." -ForegroundColor Green
        Install-Dependencies
        Install-FrontendDependencies
        Setup-Environment
        Initialize-Database
        Build-Frontend
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Installation complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
        Write-Host "2. Run: .\deploy_windows.ps1 -Action start" -ForegroundColor White
    }
    "update" {
        Update-Application
    }
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Stop-Services
        Start-Sleep -Seconds 2
        Start-Services
    }
    "build" {
        Build-Frontend
    }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Write-Host "Available actions: install, update, start, stop, restart, build" -ForegroundColor Yellow
    }
}

