from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.security import verify_password, create_access_token, create_refresh_token
from app.routers.organizations.org_models import Organization
from app.routers.businesses.biz_models import Business
from app.routers.businesses.staff_models import Staff
from app.routers.admin.admin_models import Admin

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login-admin")
def login_admin(login_data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == login_data.email).first()
    if not admin or not verify_password(login_data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    data = {
        "sub": str(admin.id),
        "role": "admin"
    }

    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "role": "admin",
        "admin_id": str(admin.id)
    }


@router.post("/login-org")
def login_org(login_data: LoginRequest, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.email == login_data.email).first()
    if not org or not verify_password(login_data.password, org.password_hash):
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
        "org_id": str(org.id)
    }


@router.post("/login-business")
def login_business(login_data: LoginRequest, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.email == login_data.email).first()
    if not business or not verify_password(login_data.password, business.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    data = {
        "sub": str(business.id),
        "role": "business",
        "business_id": str(business.id),
        "org_id": str(business.org_id)
    }

    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "role": "business",
        "business_id": str(business.id),
        "org_id": str(business.org_id)
    }


@router.post("/login-staff")
def login_staff(login_data: LoginRequest, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.email == login_data.email, Staff.active == True).first()
    if not staff or not verify_password(login_data.password, staff.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    data = {
        "sub": str(staff.id),
        "role": "staff",
        "staff_id": str(staff.id),
        "business_id": str(staff.business_id)
    }

    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "role": "staff",
        "staff_id": str(staff.id),
        "business_id": str(staff.business_id)
    }
