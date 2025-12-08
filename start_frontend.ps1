# Navigate to frontend directory
Set-Location frontend

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    "REACT_APP_API_URL=http://localhost:8000" | Out-File -FilePath ".env" -Encoding utf8
}

# Start the frontend server
Write-Host "Starting frontend server on http://localhost:3000" -ForegroundColor Green
npm start

