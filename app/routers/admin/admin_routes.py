from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.routers.admin.admin_models import Admin
from app.routers.businesses.biz_models import Business
from app.routers.organizations.org_models import Organization
from app.security import hash_password
from app.dependencies import get_db, get_current_admin
from app.routers.admin.admin_schemas import AdminCreate, AdminResponse

router = APIRouter()

@router.post("/create", response_model=AdminResponse)
def create_admin(admin_data: AdminCreate, db: Session = Depends(get_db)):
    """Create or reset an admin user.

    If an admin with this email already exists, its password is updated.
    """
    existing = db.query(Admin).filter(Admin.email == admin_data.email).first()
    if existing:
        existing.password_hash = hash_password(admin_data.password)
        db.commit()
        db.refresh(existing)
        return existing

    admin = Admin(
        email=admin_data.email,
        password_hash=hash_password(admin_data.password)
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

@router.post("/organization/create")
def create_organization_by_admin(
    name: str,
    email: str,
    password: str,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new organization (admin only)"""
    # Check if organization email already exists
    existing = db.query(Organization).filter(Organization.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization with this email already exists")
    
    org = Organization(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return {
        "id": str(org.id),
        "name": org.name,
        "email": org.email,
        "created_at": org.created_at
    }

@router.post("/business/create")
def create_business_by_admin(
    org_id: str,
    name: str,
    email: str,
    password: str,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Verify organization exists
    from uuid import UUID
    try:
        org_uuid = UUID(org_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid organization ID format")
    
    org = db.query(Organization).filter(Organization.id == org_uuid).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Check if business email already exists
    existing = db.query(Business).filter(Business.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Business with this email already exists")
    
    business = Business(
        org_id=org_uuid,
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return business

@router.get("/organizations")
def list_organizations(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    orgs = db.query(Organization).all()
    return [{"id": str(org.id), "name": org.name, "email": org.email, "created_at": org.created_at} for org in orgs]

@router.get("/businesses")
def list_all_businesses(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    businesses = db.query(Business).all()
    return [
        {
            "id": str(biz.id),
            "org_id": str(biz.org_id),
            "name": biz.name,
            "email": biz.email,
            "created_at": biz.created_at
        }
        for biz in businesses
    ]

