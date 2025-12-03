from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.security import verify_password, create_access_token, create_refresh_token
from app.routers.organizations.org_models import Organization
from app.routers.businesses.biz_models import Business
from app.routers.customers.cust_models import Customer

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login-org")
def login_org(email: str, password: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.email == email).first()
    if not org or not verify_password(password, org.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    data = {
        "sub": str(org.id),
        "role": "organization",
        "org_id": str(org.id)
    }

    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "role": "organization",
        "org_id": org.id
    }
