# Quick Start Guide

## ✅ Backend Status: RUNNING

- **Backend URL:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Status:** ✓ Active and ready

## ⚠️ Frontend: Requires Node.js

To start the frontend, you need to install Node.js first.

### Quick Install Node.js:

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Click "Download Node.js (LTS)" - this is the recommended version
   - The installer will download automatically

2. **Install Node.js:**
   - Run the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - **Important:** Make sure "Add to PATH" is checked
   - Complete the installation

3. **Restart PowerShell/Command Prompt** after installation

4. **Verify Installation:**
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.x.x and 10.x.x)

### Then Start Frontend:

```powershell
# Navigate to frontend directory
cd C:\Users\vijay\backend\frontend

# Install dependencies (first time only)
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start the frontend
npm start
```

The browser will automatically open to http://localhost:3000

## Alternative: Test Backend Now

You can test the backend API right now using the Swagger UI:

1. Open your browser
2. Go to: **http://localhost:8000/docs**
3. You'll see an interactive API documentation
4. You can test all endpoints directly from there!

### Try These Endpoints:

1. **Create an Organization:**
   - POST `/organizations/create`
   - Body: `{"name": "Test Org", "email": "org@test.com", "password": "test123"}`

2. **Login as Organization:**
   - POST `/auth/login-org`
   - Body: `{"email": "org@test.com", "password": "test123"}`

3. **Create a Business (after login):**
   - POST `/organizations/business/create`
   - Use the token from login in the Authorization header

## Summary

**Right Now:**
- ✅ Backend: Running on port 8000
- ✅ Database: Connected
- ✅ API: Fully functional
- ⏳ Frontend: Waiting for Node.js installation

**After Installing Node.js:**
- Run `npm install` in the frontend directory
- Run `npm start`
- Frontend will be available at http://localhost:3000

## Need Help?

Check `SETUP_INSTRUCTIONS.md` for detailed troubleshooting and setup information.

