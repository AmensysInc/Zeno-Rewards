# Deployment Checklist

Use this checklist to ensure your Windows VPS deployment is complete and secure.

## Pre-Deployment

- [ ] Windows Server/VPS is set up and accessible
- [ ] Python 3.8+ is installed
- [ ] Node.js 16+ and npm are installed
- [ ] Git is installed (if pulling from repository)
- [ ] Administrator access is available

## Installation

- [ ] Project files are copied to VPS
- [ ] `deploy_windows.ps1 -Action install` completed successfully
- [ ] All dependencies installed (Python and Node.js)
- [ ] Database initialized
- [ ] Frontend built successfully

## Configuration

- [ ] `.env` file created and configured
- [ ] `SECRET_KEY` changed to strong random string (min 32 chars)
- [ ] `FRONTEND_URL` set to actual domain
- [ ] `BACKEND_URL` set to actual domain
- [ ] `DATABASE_URL` configured (SQLite or PostgreSQL)
- [ ] SMTP settings configured for email
- [ ] `frontend/.env.production` created with `VITE_API_URL`
- [ ] Frontend rebuilt after setting `VITE_API_URL`

## Security

- [ ] Strong `SECRET_KEY` set (not default)
- [ ] Firewall rules configured
- [ ] SSL/HTTPS certificate installed (recommended)
- [ ] CORS settings updated for production domain
- [ ] Database credentials secured (if using PostgreSQL)
- [ ] SMTP credentials secured
- [ ] File permissions restricted appropriately

## Service Setup

- [ ] Backend service configured (NSSM, Task Scheduler, or manual)
- [ ] Service starts automatically on boot
- [ ] Service is running and accessible
- [ ] Logs are configured and accessible

## Network & Firewall

- [ ] Port 8000 (backend) is open in firewall
- [ ] Port 80/443 (HTTP/HTTPS) is open if using reverse proxy
- [ ] Reverse proxy configured (if using)
- [ ] Domain DNS points to VPS IP

## Testing

- [ ] Backend API accessible at `http://your-domain.com:8000/docs`
- [ ] Frontend loads at `http://your-domain.com`
- [ ] API calls from frontend work correctly
- [ ] Login functionality works
- [ ] Customer registration works
- [ ] Email sending works (test welcome email)
- [ ] File upload works (transaction upload)
- [ ] All user roles work correctly (admin, org, business, staff, customer)

## Monitoring

- [ ] Logs are being written
- [ ] Error logging is working
- [ ] Health check endpoint accessible (if implemented)
- [ ] Monitoring solution configured (optional)

## Backup & Maintenance

- [ ] Database backup strategy in place
- [ ] Backup schedule configured
- [ ] Update procedure documented
- [ ] Rollback procedure documented

## Documentation

- [ ] Deployment documentation reviewed
- [ ] Environment variables documented
- [ ] Service management procedures documented
- [ ] Troubleshooting guide accessible

## Post-Deployment

- [ ] Initial admin account created
- [ ] Test organization created
- [ ] Test business created
- [ ] Test customer registered
- [ ] Test transaction uploaded
- [ ] Test offer created and redeemed
- [ ] All features tested end-to-end

## Performance

- [ ] Backend workers configured (4+ workers recommended)
- [ ] Database performance acceptable
- [ ] Frontend loads quickly
- [ ] API response times acceptable

## Final Verification

- [ ] Application is accessible from internet
- [ ] SSL certificate valid (if using HTTPS)
- [ ] No security warnings in browser
- [ ] All functionality works as expected
- [ ] Service restarts automatically after reboot

---

## Quick Commands Reference

```powershell
# Start services
.\deploy_windows.ps1 -Action start
# or
.\start_production.ps1

# Stop services
.\deploy_windows.ps1 -Action stop

# Restart services
.\deploy_windows.ps1 -Action restart

# Update application
.\deploy_windows.ps1 -Action update

# Check service status (if using NSSM)
Get-Service ZenoRewardsBackend

# View logs (if using NSSM)
Get-Content logs\stdout.log
Get-Content logs\stderr.log
```

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Domain:** _______________
**Notes:** _______________

