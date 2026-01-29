# Quick VPS Setup Script for 163.123.180.171
# This script configures the environment for your specific VPS

param(
    [string]$ProjectPath = $PSScriptRoot
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VPS Setup for 163.123.180.171" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$vpsIP = "163.123.180.171"

# Step 1: Create .env file
Write-Host "Step 1: Creating .env file..." -ForegroundColor Yellow

if (Test-Path "$ProjectPath\.env") {
    $response = Read-Host ".env file already exists. Overwrite? (y/n)"
    if ($response -ne "y") {
        Write-Host "Skipping .env creation." -ForegroundColor Yellow
    } else {
        Copy-Item "$ProjectPath\env.vps.example" "$ProjectPath\.env" -Force
        Write-Host "✓ Created .env from VPS template" -ForegroundColor Green
    }
} else {
    Copy-Item "$ProjectPath\env.vps.example" "$ProjectPath\.env" -Force
    Write-Host "✓ Created .env from VPS template" -ForegroundColor Green
}

# Step 2: Generate SECRET_KEY
Write-Host ""
Write-Host "Step 2: Generating SECRET_KEY..." -ForegroundColor Yellow
$secretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
(Get-Content "$ProjectPath\.env") -replace 'SECRET_KEY=.*', "SECRET_KEY=$secretKey" | Set-Content "$ProjectPath\.env"
Write-Host "✓ Generated and set SECRET_KEY" -ForegroundColor Green

# Step 3: Create frontend .env.production
Write-Host ""
Write-Host "Step 3: Creating frontend .env.production..." -ForegroundColor Yellow

if (Test-Path "$ProjectPath\frontend\.env.production") {
    $response = Read-Host "frontend/.env.production already exists. Overwrite? (y/n)"
    if ($response -ne "y") {
        Write-Host "Skipping frontend .env.production creation." -ForegroundColor Yellow
    } else {
        Copy-Item "$ProjectPath\frontend\.env.vps.production.example" "$ProjectPath\frontend\.env.production" -Force
        Write-Host "✓ Created frontend/.env.production" -ForegroundColor Green
    }
} else {
    Copy-Item "$ProjectPath\frontend\.env.vps.production.example" "$ProjectPath\frontend\.env.production" -Force
    Write-Host "✓ Created frontend/.env.production" -ForegroundColor Green
}

# Step 4: Configure Firewall
Write-Host ""
Write-Host "Step 4: Configuring Windows Firewall..." -ForegroundColor Yellow

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    # Check if rules already exist
    $backendRule = Get-NetFirewallRule -DisplayName "Zeno Rewards Backend" -ErrorAction SilentlyContinue
    $frontendRule = Get-NetFirewallRule -DisplayName "Zeno Rewards Frontend" -ErrorAction SilentlyContinue
    
    if (-not $backendRule) {
        New-NetFirewallRule -DisplayName "Zeno Rewards Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow | Out-Null
        Write-Host "✓ Added firewall rule for port 8000 (backend)" -ForegroundColor Green
    } else {
        Write-Host "✓ Firewall rule for port 8000 already exists" -ForegroundColor Green
    }
    
    if (-not $frontendRule) {
        New-NetFirewallRule -DisplayName "Zeno Rewards Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null
        Write-Host "✓ Added firewall rule for port 3000 (frontend)" -ForegroundColor Green
    } else {
        Write-Host "✓ Firewall rule for port 3000 already exists" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ Not running as Administrator. Skipping firewall configuration." -ForegroundColor Yellow
    Write-Host "  Run this script as Administrator to configure firewall automatically." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VPS Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "  VPS IP: $vpsIP" -ForegroundColor White
Write-Host "  Frontend URL: http://$vpsIP`:3000" -ForegroundColor White
Write-Host "  Backend URL: http://$vpsIP`:8000" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review and update .env file (especially SMTP settings)" -ForegroundColor White
Write-Host "2. Run: .\deploy_windows.ps1 -Action install" -ForegroundColor White
Write-Host "3. Start backend: .\start_production.ps1" -ForegroundColor White
Write-Host "4. Start frontend: cd frontend && npm run dev -- --host 0.0.0.0 --port 3000" -ForegroundColor White
Write-Host ""
Write-Host "Access your application at:" -ForegroundColor Cyan
Write-Host "  http://$vpsIP`:3000" -ForegroundColor Green
Write-Host "  http://$vpsIP`:8000/docs" -ForegroundColor Green

