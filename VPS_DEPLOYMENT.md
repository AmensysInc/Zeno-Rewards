# VPS Deployment Guide - IP: 163.123.180.171

This guide is specifically for deploying to your Windows VPS at `163.123.180.171`.

## Deployment Options

You have **two main options** for accessing your application:

### Option 1: Direct Port Access (Simpler - Recommended for Testing)

**Access URLs:**
- **Frontend:** `http://163.123.180.171:3000`
- **Backend API:** `http://163.123.180.171:8000`
- **API Docs:** `http://163.123.180.171:8000/docs`

**Configuration:**
- Frontend runs as development server on port 3000
- Backend runs on port 8000
- Both accessible directly via IP:port

### Option 2: Production Build with Reverse Proxy (Recommended for Production)

**Access URLs:**
- **Application:** `http://163.123.180.171/` (port 80)
- **API:** `http://163.123.180.171/api` (proxied to backend)
- **API Docs:** `http://163.123.180.171:8000/docs` (direct access)

**Configuration:**
- Frontend is built and served as static files
- Backend runs on port 8000
- IIS/Nginx serves frontend on port 80 and proxies API requests

---

## Quick Setup (Option 1 - Direct Port Access)

### Step 1: Connect to VPS

Use Remote Desktop Connection:
- **Computer:** `163.123.180.171:1097`
- **Username:** `MicrosoftAccount\administrator`

### Step 2: Copy Project Files

Copy your project to the VPS (e.g., `C:\ZenoRewards\`)

### Step 3: Configure Environment

Create `.env` file in the project root:

```env
# Database
DATABASE_URL=sqlite:///./rewards.db

# Security - CHANGE THIS!
SECRET_KEY=your-super-secret-key-minimum-32-characters-long

# Frontend/Backend URLs - Use your VPS IP
FRONTEND_URL=http://163.123.180.171:3000
BACKEND_URL=http://163.123.180.171:8000

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

### Step 4: Configure Frontend

Create `frontend/.env.production`:

```env
VITE_API_URL=http://163.123.180.171:8000
```

### Step 5: Install and Deploy

```powershell
# Run as Administrator
cd C:\ZenoRewards

# Install everything
.\deploy_windows.ps1 -Action install

# Edit .env file with your values (see Step 3)

# Rebuild frontend with correct API URL
cd frontend
npm run build
cd ..

# Start backend
.\start_production.ps1
```

In a **separate PowerShell window**:

```powershell
cd C:\ZenoRewards\frontend
npm run dev -- --host 0.0.0.0 --port 3000
```

### Step 6: Configure Firewall

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Zeno Rewards Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Zeno Rewards Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Step 7: Access Your Application

- **Frontend:** http://163.123.180.171:3000
- **Backend API:** http://163.123.180.171:8000
- **API Docs:** http://163.123.180.171:8000/docs

---

## Production Setup (Option 2 - Reverse Proxy)

### Step 1-4: Same as Option 1

### Step 5: Build Frontend for Production

```powershell
cd frontend
npm run build
cd ..
```

This creates static files in `frontend/dist/`

### Step 6: Configure IIS (Windows Web Server)

1. **Install IIS:**
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-ApplicationInit
   ```

2. **Install URL Rewrite Module:**
   - Download from: https://www.iis.net/downloads/microsoft/url-rewrite
   - Install the module

3. **Create IIS Site:**
   - Open IIS Manager
   - Add new site:
     - **Name:** ZenoRewards
     - **Physical Path:** `C:\ZenoRewards\frontend\dist`
     - **Binding:** Port 80, IP: All Unassigned

4. **Configure Reverse Proxy:**
   - Install Application Request Routing (ARR) module
   - Create URL Rewrite rule:
     - **Pattern:** `^api/(.*)`
     - **Rewrite URL:** `http://localhost:8000/{R:1}`
     - **Action:** Reverse Proxy

5. **Configure Static File Serving:**
   - Ensure static files are served from `frontend/dist`
   - Set default document to `index.html`

### Step 7: Start Backend

```powershell
.\start_production.ps1
```

Or install as Windows Service:
```powershell
.\nssm_service_install.ps1
net start ZenoRewardsBackend
```

### Step 8: Access Your Application

- **Application:** http://163.123.180.171/
- **API:** http://163.123.180.171/api/...
- **API Docs:** http://163.123.180.171:8000/docs

---

## Windows Service Setup (Recommended)

To run backend automatically on startup:

```powershell
# Download NSSM from https://nssm.cc/download
# Extract to C:\nssm

# Install service
.\nssm_service_install.ps1 -NSSMPath "C:\nssm\win64\nssm.exe"

# Start service
net start ZenoRewardsBackend

# Set to auto-start
Set-Service ZenoRewardsBackend -StartupType Automatic
```

---

## Testing Your Deployment

1. **Test Backend:**
   ```
   http://163.123.180.171:8000/docs
   ```

2. **Test Frontend:**
   ```
   http://163.123.180.171:3000
   ```

3. **Test API Connection:**
   - Open frontend
   - Try to login
   - Check browser console for API calls

---

## Troubleshooting

### Can't Access from Internet

1. **Check Firewall:**
   ```powershell
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Zeno*"}
   ```

2. **Check if Ports are Listening:**
   ```powershell
   Get-NetTCPConnection -LocalPort 8000,3000
   ```

3. **Check VPS Firewall Rules:**
   - Ensure ports 3000 and 8000 are open in VPS provider's firewall
   - Some VPS providers have additional firewall settings

### Frontend Can't Connect to Backend

1. **Check `VITE_API_URL` in `frontend/.env.production`:**
   ```env
   VITE_API_URL=http://163.123.180.171:8000
   ```

2. **Rebuild frontend:**
   ```powershell
   cd frontend
   npm run build
   ```

3. **Check CORS settings in `app/main.py`** - should allow your frontend URL

### Backend Not Starting

1. **Check logs:**
   ```powershell
   Get-Content logs\stdout.log
   Get-Content logs\stderr.log
   ```

2. **Check environment variables:**
   ```powershell
   Get-Content .env
   ```

3. **Test database connection:**
   ```powershell
   .\venv\Scripts\python.exe -c "from app.database import engine; engine.connect()"
   ```

---

## Security Recommendations

1. **Change Default SECRET_KEY** - Use a strong random string
2. **Use HTTPS** - Set up SSL certificate (Let's Encrypt)
3. **Restrict Firewall** - Only open necessary ports
4. **Regular Updates** - Keep system and dependencies updated
5. **Backup Database** - Set up regular backups

---

## Next Steps

- [ ] Deploy application
- [ ] Test all functionality
- [ ] Set up SSL/HTTPS
- [ ] Configure automatic backups
- [ ] Set up monitoring
- [ ] Document your specific configuration

