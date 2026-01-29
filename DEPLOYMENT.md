# Windows VPS Deployment Guide

This guide will help you deploy the Zeno Rewards application on a Windows VPS.

## Prerequisites

1. **Windows Server** (Windows Server 2016 or later, or Windows 10/11)
2. **Python 3.8+** installed
3. **Node.js 16+** and npm installed
4. **Git** (optional, if pulling from repository)
5. **Administrator access** (recommended)

## Quick Start

### 1. Initial Setup

```powershell
# Clone or copy the project to your VPS
cd C:\
git clone https://github.com/AmensysInc/Zeno-Rewards.git
cd Zeno-Rewards

# Or if you already have the files, navigate to the project directory
cd C:\path\to\your\project
```

### 2. Run Deployment Script

```powershell
# Run as Administrator (Right-click PowerShell -> Run as Administrator)
.\deploy_windows.ps1 -Action install
```

This will:
- Install Python dependencies
- Install frontend dependencies
- Create `.env` file from template
- Initialize database
- Build frontend for production

### 3. Configure Environment Variables

Edit the `.env` file with your production settings:

```env
# Database (use PostgreSQL for production)
DATABASE_URL=postgresql://user:password@localhost:5432/rewards_db
# Or SQLite for simple deployments:
# DATABASE_URL=sqlite:///./rewards.db

# Security - CHANGE THIS!
SECRET_KEY=your-super-secret-key-minimum-32-characters-long

# Frontend/Backend URLs (use your actual domain)
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com:8000
# Or if using HTTP:
# FRONTEND_URL=http://your-domain.com
# BACKEND_URL=http://your-domain.com:8000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Zeno Rewards
SMTP_USE_TLS=true

# Environment
ENVIRONMENT=production
```

**Important:** 
- Generate a strong `SECRET_KEY` (minimum 32 characters)
- Update `FRONTEND_URL` and `BACKEND_URL` with your actual domain
- Configure SMTP settings for email functionality

### 4. Start the Application

```powershell
.\deploy_windows.ps1 -Action start
```

Or manually:

```powershell
# Set environment variables
$env:DATABASE_URL = "sqlite:///./rewards.db"
$env:SECRET_KEY = "your-secret-key"

# Start backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Production Configuration Options

### Option 1: Run as Windows Service (Recommended)

#### Using NSSM (Non-Sucking Service Manager)

1. Download NSSM from https://nssm.cc/download
2. Extract and run `nssm.exe install ZenoRewardsBackend`
3. Configure:
   - **Path:** `C:\path\to\project\venv\Scripts\python.exe`
   - **Arguments:** `-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`
   - **Startup directory:** `C:\path\to\project`
   - **Environment variables:**
     - `DATABASE_URL=sqlite:///./rewards.db`
     - `SECRET_KEY=your-secret-key`
     - `FRONTEND_URL=https://your-domain.com`
     - `BACKEND_URL=https://your-domain.com:8000`
     - `ENVIRONMENT=production`

4. Start the service:
   ```powershell
   nssm start ZenoRewardsBackend
   ```

#### Using Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Zeno Rewards Backend"
4. Trigger: "When the computer starts"
5. Action: "Start a program"
   - Program: `C:\path\to\project\venv\Scripts\python.exe`
   - Arguments: `-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`
   - Start in: `C:\path\to\project`
6. Add environment variables in "General" tab → "Run whether user is logged on or not"

### Option 2: Use IIS with HTTP Platform Handler

1. Install IIS and HTTP Platform Handler
2. Configure reverse proxy to forward requests to `http://localhost:8000`
3. Set up SSL certificate for HTTPS

### Option 3: Use a Reverse Proxy (Nginx on WSL or IIS)

Configure Nginx or IIS to:
- Serve static files from `frontend/dist`
- Proxy API requests to `http://localhost:8000`

## Firewall Configuration

Allow incoming connections on port 8000 (backend) and 3000 (if serving frontend separately):

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Zeno Rewards Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Zeno Rewards Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## SSL/HTTPS Setup

### Using Let's Encrypt (with Certbot)

1. Install Certbot for Windows
2. Run: `certbot certonly --standalone -d your-domain.com`
3. Configure your reverse proxy (IIS/Nginx) to use the certificates

### Using IIS with SSL Certificate

1. Import your SSL certificate in IIS
2. Configure HTTPS binding
3. Set up URL rewrite rules for reverse proxy

## Database Setup

### SQLite (Simple, for small deployments)

No additional setup needed. The database file will be created automatically.

### PostgreSQL (Recommended for production)

1. Install PostgreSQL on Windows
2. Create database:
   ```sql
   CREATE DATABASE rewards_db;
   CREATE USER rewards_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE rewards_db TO rewards_user;
   ```
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://rewards_user:your_password@localhost:5432/rewards_db
   ```

## Frontend Configuration

### Build for Production

The deployment script automatically builds the frontend. To rebuild manually:

```powershell
cd frontend
npm run build
```

### Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-domain.com:8000
```

Then rebuild:
```powershell
npm run build
```

## Updating the Application

```powershell
# Pull latest code (if using git)
git pull

# Update and restart
.\deploy_windows.ps1 -Action update
```

Or manually:

```powershell
# Stop services
.\deploy_windows.ps1 -Action stop

# Update dependencies
.\venv\Scripts\pip.exe install -r requirements.txt
cd frontend
npm install
npm run build
cd ..

# Start services
.\deploy_windows.ps1 -Action start
```

## Monitoring and Logs

### View Logs

Backend logs are printed to the console. For production, redirect to a log file:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 > backend.log 2>&1
```

### Health Check

The backend provides a health check endpoint:
- `http://your-domain.com:8000/docs` - API documentation
- `http://your-domain.com:8000/health` - Health check (if implemented)

## Troubleshooting

### Port Already in Use

```powershell
# Find process using port 8000
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess

# Kill the process
Stop-Process -Id <PID> -Force
```

### Database Connection Issues

- Check `DATABASE_URL` in `.env`
- Ensure database service is running (for PostgreSQL)
- Check file permissions (for SQLite)

### Frontend Not Loading

- Verify `frontend/dist` folder exists
- Check `FRONTEND_URL` in `.env` matches your domain
- Rebuild frontend: `cd frontend && npm run build`

### CORS Errors

- Update `FRONTEND_URL` in `.env` to match your actual frontend URL
- Ensure backend is running and accessible

## Security Checklist

- [ ] Changed `SECRET_KEY` to a strong random string
- [ ] Updated `FRONTEND_URL` and `BACKEND_URL` with actual domains
- [ ] Configured firewall rules
- [ ] Set up SSL/HTTPS
- [ ] Configured SMTP for email
- [ ] Set up database backups (for PostgreSQL)
- [ ] Configured Windows Firewall
- [ ] Set up monitoring/logging
- [ ] Restricted file permissions
- [ ] Updated all default passwords

## Support

For issues or questions, please check:
- API Documentation: `http://your-domain.com:8000/docs`
- Logs: Check console output or log files
- GitHub Issues: [Repository Issues](https://github.com/AmensysInc/Zeno-Rewards/issues)

