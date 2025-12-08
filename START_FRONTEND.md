# How to Start the Frontend

## ⚠️ IMPORTANT: Node.js Required

The frontend **cannot start** without Node.js installed on your system.

## Quick Installation

### Step 1: Install Node.js

1. **Download Node.js:**
   - I've opened the download page for you: https://nodejs.org/
   - Click the **green "LTS" button** (recommended version)
   - The installer will download automatically

2. **Install Node.js:**
   - Run the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - **IMPORTANT:** Make sure "Add to PATH" is checked ✅
   - Complete the installation

3. **Restart PowerShell:**
   - Close this PowerShell window
   - Open a new PowerShell window
   - This ensures Node.js is in your PATH

### Step 2: Verify Installation

Open a new PowerShell and run:
```powershell
node --version
npm --version
```

You should see version numbers (e.g., `v20.x.x` and `10.x.x`)

### Step 3: Start Frontend

Once Node.js is installed, run:
```powershell
cd C:\Users\vijay\backend
.\restart_frontend.ps1
```

Or manually:
```powershell
cd C:\Users\vijay\backend\frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8000" > .env
npm start
```

## What Happens Next

1. First time: `npm install` will download all dependencies (takes 1-2 minutes)
2. The frontend will compile
3. Your browser will automatically open to **http://localhost:3000**
4. You'll see the login page!

## Current Status

- ✅ **Backend:** Running on http://localhost:8000
- ✅ **Database:** Connected
- ❌ **Frontend:** Waiting for Node.js installation

## Need Help?

If you encounter any issues:
1. Make sure Node.js is installed: `node --version`
2. Make sure you're in the correct directory
3. Check that the backend is running: http://localhost:8000/docs
4. See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting

## Alternative: Test Backend Now

While you install Node.js, you can test the backend API:
- Open: **http://localhost:8000/docs**
- This is a full interactive API testing interface
- You can create organizations, login, and test all endpoints!

