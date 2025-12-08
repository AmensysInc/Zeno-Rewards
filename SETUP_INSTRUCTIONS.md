# Setup Instructions

## Current Status

✅ **Backend is running** on http://localhost:8000
✅ **Database is connected** (PostgreSQL)
❌ **Frontend requires Node.js** (not currently installed)

## To Start the Frontend

### Step 1: Install Node.js

1. Download Node.js from: https://nodejs.org/
   - Download the LTS (Long Term Support) version
   - Choose the Windows Installer (.msi) for 64-bit

2. Run the installer:
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option
   - Complete the installation

3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Install Frontend Dependencies

Open a new PowerShell window and run:

```powershell
cd C:\Users\vijay\backend\frontend
npm install
```

This will install all required packages (React, React Router, Axios, etc.)

### Step 3: Create Environment File

Create a `.env` file in the `frontend` directory:

```powershell
cd C:\Users\vijay\backend\frontend
echo "REACT_APP_API_URL=http://localhost:8000" > .env
```

Or manually create `.env` file with this content:
```
REACT_APP_API_URL=http://localhost:8000
```

### Step 4: Start Frontend

```powershell
cd C:\Users\vijay\backend\frontend
npm start
```

The frontend will automatically open in your browser at http://localhost:3000

## Quick Start Scripts

Once Node.js is installed, you can use:

**Start Backend:**
```powershell
.\start_backend.ps1
```

**Start Frontend:**
```powershell
.\start_frontend.ps1
```

**Start Both:**
```powershell
.\start_all.ps1
```

## Testing the Backend (Right Now)

Even without the frontend, you can test the backend:

1. **API Documentation (Swagger UI):**
   - Open: http://localhost:8000/docs
   - Interactive API testing interface

2. **Alternative API Docs (ReDoc):**
   - Open: http://localhost:8000/redoc

3. **Test Endpoints:**
   - Health check: http://localhost:8000/
   - API root: http://localhost:8000/docs

## Backend Endpoints

- **Auth:**
  - POST `/auth/login-admin` - Admin login
  - POST `/auth/login-org` - Organization login
  - POST `/auth/login-business` - Business login

- **Admin:**
  - GET `/admin/organizations` - List organizations
  - GET `/admin/businesses` - List all businesses
  - POST `/admin/business/create` - Create business

- **Organizations:**
  - GET `/organizations/dashboard` - Org dashboard
  - GET `/organizations/businesses` - List org's businesses
  - POST `/organizations/business/create` - Create business

- **Business:**
  - GET `/businesses/dashboard` - Business dashboard

- **Transactions:**
  - POST `/transactions/upload/preview` - Preview transactions
  - POST `/transactions/approve` - Approve transactions
  - GET `/transactions/` - List transactions
  - GET `/transactions/summary` - Transaction summary

## Troubleshooting

### Backend Issues

If backend stops working:
```powershell
cd C:\Users\vijay\backend
$env:DATABASE_URL="postgresql://admin:password@localhost:5432/rewards"
$env:SECRET_KEY="supersecretkeyhere"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Database Connection

Make sure PostgreSQL is running:
```powershell
docker ps
```

If not running:
```powershell
docker-compose up -d db
```

### Frontend Port Already in Use

If port 3000 is busy, React will ask to use a different port. Accept it or kill the process using port 3000.

## Next Steps

1. Install Node.js (see Step 1 above)
2. Install frontend dependencies
3. Start frontend server
4. Open http://localhost:3000 in browser
5. Login with your credentials!

