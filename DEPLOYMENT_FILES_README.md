# Deployment Files Overview

This document describes all the deployment-related files created for Windows VPS deployment.

## Configuration Files

### `env.example`
- **Purpose:** Template for environment variables
- **Usage:** Copy to `.env` and fill in your actual values
- **Contains:** Database URL, secret keys, SMTP settings, frontend/backend URLs

### `app/config.py`
- **Purpose:** Centralized configuration management
- **Changes:** Enhanced to read from environment variables and support production settings
- **Features:** 
  - Environment detection (production vs development)
  - CORS configuration based on environment
  - Email/SMTP settings
  - Frontend/Backend URL management

### `app/main.py`
- **Purpose:** Main FastAPI application
- **Changes:** 
  - Updated CORS to use production settings
  - Added static file serving for production
  - SPA routing support for frontend

### `frontend/vite.config.production.js`
- **Purpose:** Production build configuration for Vite
- **Usage:** Optional - can be used for production-specific build settings

## Deployment Scripts

### `deploy_windows.ps1`
- **Purpose:** Main deployment automation script
- **Actions:**
  - `install` - Full installation (dependencies, database, build)
  - `update` - Update application and restart
  - `start` - Start services
  - `stop` - Stop services
  - `restart` - Restart services
  - `build` - Build frontend only
- **Usage:** `.\deploy_windows.ps1 -Action install`

### `start_production.ps1`
- **Purpose:** Start backend server in production mode
- **Features:**
  - Loads environment variables from `.env`
  - Validates configuration
  - Starts uvicorn with production settings (multiple workers)
- **Usage:** `.\start_production.ps1`

### `nssm_service_install.ps1`
- **Purpose:** Install backend as Windows Service using NSSM
- **Requirements:** NSSM downloaded and extracted
- **Usage:** `.\nssm_service_install.ps1 -NSSMPath "C:\nssm\win64\nssm.exe"`
- **Benefits:** 
  - Automatic startup on boot
  - Service management via Windows Services
  - Log file management

## Documentation

### `DEPLOYMENT.md`
- **Purpose:** Comprehensive deployment guide
- **Contents:**
  - Prerequisites
  - Step-by-step installation
  - Production configuration options
  - Windows Service setup
  - SSL/HTTPS configuration
  - Database setup (SQLite and PostgreSQL)
  - Firewall configuration
  - Troubleshooting guide

### `QUICK_DEPLOY.md`
- **Purpose:** Quick reference for deployment
- **Contents:** Condensed step-by-step guide for fast deployment

### `DEPLOYMENT_CHECKLIST.md`
- **Purpose:** Deployment verification checklist
- **Use:** Check off items as you complete deployment steps
- **Sections:**
  - Pre-deployment
  - Installation
  - Configuration
  - Security
  - Testing
  - Monitoring

## Updated Files

### `app/routers/notifications/email_service.py`
- **Changes:** Updated to use `settings.FRONTEND_URL` instead of `os.getenv()`
- **Benefit:** Consistent configuration management

### `.gitignore`
- **Purpose:** Exclude sensitive and build files from git
- **Excludes:**
  - `.env` files
  - Database files
  - Build artifacts
  - Logs
  - Virtual environments

## File Structure

```
project/
├── app/
│   ├── config.py              # Enhanced configuration
│   ├── main.py                # Updated CORS and static serving
│   └── routers/
│       └── notifications/
│           └── email_service.py  # Updated to use config
├── frontend/
│   ├── .env.production.example   # Frontend env template
│   └── vite.config.production.js # Production build config
├── deploy_windows.ps1         # Main deployment script
├── start_production.ps1      # Production startup script
├── nssm_service_install.ps1 # Windows Service installer
├── env.example               # Backend env template
├── DEPLOYMENT.md             # Full deployment guide
├── QUICK_DEPLOY.md           # Quick deployment guide
├── DEPLOYMENT_CHECKLIST.md   # Deployment checklist
└── .gitignore                # Git ignore rules
```

## Quick Start

1. **Copy environment template:**
   ```powershell
   Copy-Item env.example .env
   # Edit .env with your values
   ```

2. **Run installation:**
   ```powershell
   .\deploy_windows.ps1 -Action install
   ```

3. **Configure:**
   - Edit `.env` file
   - Create `frontend/.env.production`
   - Rebuild frontend: `cd frontend && npm run build`

4. **Start:**
   ```powershell
   .\start_production.ps1
   # Or install as service:
   .\nssm_service_install.ps1
   ```

## Next Steps After Deployment

1. ✅ Configure firewall rules
2. ✅ Set up SSL/HTTPS certificate
3. ✅ Configure reverse proxy (IIS/Nginx)
4. ✅ Set up database backups
5. ✅ Configure monitoring
6. ✅ Test all functionality
7. ✅ Document your specific configuration

## Support

For issues or questions:
- Check `DEPLOYMENT.md` for detailed instructions
- Review `DEPLOYMENT_CHECKLIST.md` for verification
- Check logs: `logs\stdout.log` and `logs\stderr.log`
- API Documentation: `http://your-domain.com:8000/docs`

