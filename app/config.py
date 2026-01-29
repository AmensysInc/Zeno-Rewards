import os
from dotenv import load_dotenv

# Load environment variables
# In production, make sure .env file exists or set environment variables directly
load_dotenv()

class Settings:
    DB_URL = os.getenv("DATABASE_URL", "sqlite:///./rewards.db")
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkeyhere")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    # Email/SMTP Configuration
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@example.com")
    FROM_NAME = os.getenv("FROM_NAME", "Zeno Rewards")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    
    # Frontend/Backend URLs
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    @property
    def is_production(self):
        return self.ENVIRONMENT.lower() == "production"

settings = Settings()
