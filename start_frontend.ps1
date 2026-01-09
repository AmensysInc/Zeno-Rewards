# Navigate to frontend directory
Set-Location frontend

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Create .env file if it doesn't exist (Vite uses VITE_ prefix)
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:8000" | Out-File -FilePath ".env" -Encoding utf8
}

# Start the frontend server with Vite
Write-Host "Starting frontend server (Vite) on http://localhost:3000" -ForegroundColor Green
npm run dev
