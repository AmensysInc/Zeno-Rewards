# ⚠️ URGENT: Restart Backend Server

## The Problem
The backend server is still running the **OLD code** and needs to be restarted to load the fixes.

## How to Restart

### Step 1: Stop the Backend
1. Find the PowerShell/terminal window where the backend is running
2. Press `Ctrl+C` to stop it
3. Wait for it to fully stop

### Step 2: Start the Backend Again
Open a **NEW** PowerShell window and run:

```powershell
cd C:\Users\vijay\backend

# Set environment variables
$env:DATABASE_URL = "postgresql://admin:password@localhost:5432/rewards"
$env:SECRET_KEY = "supersecretkeyhere"

# Start the server
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Verify It Started
You should see messages like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 4: Test
1. Wait 5 seconds after seeing "Application startup complete"
2. Go to http://localhost:3000/create-org
3. Try creating an organization again

## Why This Is Needed
- The code changes we made are saved to files
- But the running Python process is still using the old code in memory
- Restarting loads the new code from the files

## If It Still Doesn't Work
After restarting, if you still get errors:
1. Check the backend terminal for error messages
2. Share those error messages
3. The new error handling will show the actual problem

