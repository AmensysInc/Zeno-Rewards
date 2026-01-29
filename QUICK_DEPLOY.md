# Quick Deployment Guide - Windows VPS

## Step-by-Step Deployment

### 1. Prepare Your VPS

```powershell
# Open PowerShell as Administrator
# Navigate to your project directory
cd C:\path\to\your\project
```

### 2. Run Installation

```powershell
# Run the deployment script
.\deploy_windows.ps1 -Action install
```

This will:
- ✅ Install Python dependencies
- ✅ Install frontend dependencies  
- ✅ Create `.env` file
- ✅ Initialize database
- ✅ Build frontend

### 3. Configure Environment

Edit `.env` file (created in step 2):

```env
# REQUIRED: Change this to a strong random string (min 32 chars)
SECRET_KEY=your-super-secret-key-here-minimum-32-characters

# REQUIRED: Update with your domain
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com:8000

# Database (SQLite is fine for small deployments)
DATABASE_URL=sqlite:///./rewards.db

# Email (required for customer welcome emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Zeno Rewards
SMTP_USE_TLS=true

ENVIRONMENT=production
```

**Generate a strong SECRET_KEY:**
```powershell
# In PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 4. Configure Frontend

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-domain.com:8000
```

Rebuild frontend:
```powershell
cd frontend
npm run build
cd ..
```

### 5. Start the Application

**Option A: Manual Start (for testing)**
```powershell
.\start_production.ps1
```

**Option B: Windows Service (recommended for production)**
```powershell
# Download NSSM from https://nssm.cc/download
# Extract to C:\nssm

# Install as service
.\nssm_service_install.ps1 -NSSMPath "C:\nssm\win64\nssm.exe"

# Start service
net start ZenoRewardsBackend
```

### 6. Configure Firewall

```powershell
# Allow port 8000 (backend)
New-NetFirewallRule -DisplayName "Zeno Rewards Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# Allow port 80/443 if using reverse proxy
New-NetFirewallRule -DisplayName "Zeno Rewards HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Zeno Rewards HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

### 7. Set Up Reverse Proxy (Optional but Recommended)

#### Using IIS:

1. Install IIS and URL Rewrite module
2. Create a new site pointing to `frontend\dist`
3. Configure reverse proxy to forward `/api/*` to `http://localhost:8000`
4. Set up SSL certificate

#### Using Nginx (on WSL):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve frontend
    location / {
        root /mnt/c/path/to/project/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Testing

1. **Backend Health Check:**
   ```
   http://your-domain.com:8000/docs
   ```

2. **Frontend:**
   ```
   http://your-domain.com
   ```

## Updating

```powershell
# Pull latest code
git pull

# Update and restart
.\deploy_windows.ps1 -Action update
```

## Troubleshooting

### Port Already in Use
```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### Service Won't Start
```powershell
# Check logs
Get-Content logs\stdout.log
Get-Content logs\stderr.log

# Check service status
Get-Service ZenoRewardsBackend
```

### Frontend Not Loading
- Verify `frontend/dist` exists
- Check `VITE_API_URL` in `frontend/.env.production`
- Rebuild: `cd frontend && npm run build`

## Next Steps

- ✅ Set up SSL/HTTPS
- ✅ Configure database backups
- ✅ Set up monitoring
- ✅ Configure email service
- ✅ Test all functionality

For detailed information, see `DEPLOYMENT.md`

