# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Set environment variables
$env:DATABASE_URL = "postgresql://admin:password@localhost:5432/rewards"
$env:SECRET_KEY = "supersecretkeyhere"

# Start the backend server
Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Green
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

