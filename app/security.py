from datetime import datetime, timedelta
from jose import jwt
import bcrypt
import hashlib
from app.config import settings

def hash_password(password: str):
    """
    Hash password using bcrypt.
    Bcrypt has a 72-byte limit, so we pre-hash with SHA256 if password is longer.
    This allows passwords of any length while maintaining security.
    """
    password_bytes = password.encode('utf-8')
    
    # If password is longer than 72 bytes, pre-hash with SHA256
    # SHA256 produces 32 bytes (64 hex chars), which is under the 72-byte limit
    if len(password_bytes) > 72:
        # Pre-hash with SHA256 to get a fixed 32-byte output
        # Use hexdigest which is 64 characters (well under 72 bytes)
        sha256_hex = hashlib.sha256(password_bytes).hexdigest()
        # Hash the SHA256 hex string with bcrypt
        return bcrypt.hashpw(sha256_hex.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    else:
        # Hash directly with bcrypt
        return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str):
    """
    Verify password against hash.
    Handles both direct bcrypt hashes and SHA256-prehashed passwords.
    """
    plain_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    
    # Try direct verification first (for passwords <= 72 bytes)
    try:
        if bcrypt.checkpw(plain_bytes, hashed_bytes):
            return True
    except:
        pass
    
    # If that fails and password is long, try SHA256 pre-hash
    if len(plain_bytes) > 72:
        try:
            sha256_hex = hashlib.sha256(plain_bytes).hexdigest()
            if bcrypt.checkpw(sha256_hex.encode('utf-8'), hashed_bytes):
                return True
        except:
            pass
    
    return False

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
