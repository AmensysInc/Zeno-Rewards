from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.routers.organizations.org_models import Organization
from app.routers.businesses.biz_models import Business
from app.routers.organizations.org_schemas import OrganizationCreate, OrganizationResponse
from app.security import hash_password
from app.dependencies import get_current_org, get_db

router = APIRouter()


@router.post("/create")
def create_org(org_data: OrganizationCreate, db: Session = Depends(get_db)):
    try:
        # Check if email already exists
        existing = db.query(Organization).filter(Organization.email == org_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Organization with this email already exists")
        
        org = Organization(
            name=org_data.name,
            email=org_data.email,
            password_hash=hash_password(org_data.password)
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        
        # Return response
        return {
            "id": str(org.id),
            "name": org.name,
            "email": org.email,
            "created_at": org.created_at.isoformat() if org.created_at else None
        }
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR in create_org: {error_detail}")  # Print to console
        raise HTTPException(status_code=500, detail=f"Error creating organization: {str(e)}")


@router.post("/business/create")
def create_business(
    name: str,
    email: str,
    password: str,
    current_org: dict = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """Create a business for the current organization"""
    from uuid import UUID
    org_id = UUID(current_org["org_id"])
    
    # Check if business email already exists
    existing = db.query(Business).filter(Business.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Business with this email already exists")
    
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


@router.get("/businesses")
def list_my_businesses(
    current_org: dict = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """List all businesses for the current organization"""
    from uuid import UUID
    org_id = UUID(current_org["org_id"])
    businesses = db.query(Business).filter(Business.org_id == org_id).all()
    return [
        {
            "id": str(biz.id),
            "name": biz.name,
            "email": biz.email,
            "created_at": biz.created_at
        }
        for biz in businesses
    ]


@router.get("/dashboard")
def org_dashboard(current_org: dict = Depends(get_current_org), db: Session = Depends(get_db)):
    """Organization dashboard"""
    from uuid import UUID
    org_id = UUID(current_org["org_id"])
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    business_count = db.query(Business).filter(Business.org_id == org_id).count()
    
    return {
        "message": "Welcome to your organization dashboard",
        "organization_name": org.name,
        "organization_id": str(org.id),
        "business_count": business_count
    }
