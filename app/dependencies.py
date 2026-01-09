from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database import SessionLocal
from app.config import settings
from app.routers.admin.admin_models import Admin
from app.routers.organizations.org_models import Organization
from app.routers.businesses.biz_models import Business
from app.routers.businesses.staff_models import Staff
from app.routers.customers.cust_models import Customer

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return {"user_id": user_id, "role": role, "org_id": payload.get("org_id"), "business_id": payload.get("business_id")}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def get_current_org(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "organization":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization access required"
        )
    return current_user

def get_current_business(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] not in ("business", "staff"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business access required"
        )
    from uuid import UUID

    business_id = None
    if current_user["role"] == "business":
        business_id = UUID(current_user["business_id"])
    else:
        # staff – resolve business via staff record
        staff_id = UUID(current_user["user_id"])
        staff = db.query(Staff).filter(Staff.id == staff_id, Staff.active == True).first()
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff not found or inactive"
            )
        business_id = staff.business_id

    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    return {"user": current_user, "business": business}


def get_current_customer(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )
    from uuid import UUID
    customer_id = UUID(current_user["user_id"])
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return {"user": current_user, "customer": customer}

def get_current_staff(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required"
        )
    from uuid import UUID
    staff_id = UUID(current_user["user_id"])
    staff = db.query(Staff).filter(Staff.id == staff_id, Staff.active == True).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found or inactive"
        )
    return {"user": current_user, "staff": staff}