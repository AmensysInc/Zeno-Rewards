import os
from dotenv import load_dotenv
load_dotenv()

class Settings:
    DB_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkeyhere")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 30
    
    # Email/SMTP Configuration
    # Set these in your .env file:
    # SMTP_HOST=smtp.gmail.com (or your SMTP server)
    # SMTP_PORT=587 (or 465 for SSL)
    # SMTP_USERNAME=your-email@gmail.com
    # SMTP_PASSWORD=your-app-password
    # FROM_EMAIL=noreply@yourdomain.com
    # FROM_NAME=Your Business Name
    # SMTP_USE_TLS=true (or false for SSL)

settings = Settings()
