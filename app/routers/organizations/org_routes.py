from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.routers.organizations.org_models import Organization
from app.routers.businesses.biz_models import Business
from app.security import hash_password

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create")
def create_org(name: str, email: str, password: str, db: Session = Depends(get_db)):
    org = Organization(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.post("/{org_id}/business/create")
def create_business(org_id: str, name: str, email: str, password: str, db: Session = Depends(get_db)):
    biz = Business(
        org_id=org_id,
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)
    return biz


@router.get("/{org_id}/dashboard")
def org_dashboard(org_id: str):
    return {"message": "Org dashboard placeholder"}
