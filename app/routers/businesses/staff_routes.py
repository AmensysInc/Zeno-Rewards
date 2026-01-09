from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database import SessionLocal
from app.dependencies import get_current_business
from app.routers.businesses.staff_models import Staff
from app.routers.businesses.staff_schemas import StaffCreate, StaffUpdate, StaffResponse
from app.security import hash_password

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=StaffResponse)
def create_staff(
    staff_data: StaffCreate,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Create a new staff/employee for the current business"""
    try:
        business_id = current["business"].id
        
        # Check if email already exists
        existing = db.query(Staff).filter(Staff.email == staff_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Staff with this email already exists")
        
        # Hash password
        password_hash = hash_password(staff_data.password)
        
        # Create staff
        staff = Staff(
            business_id=business_id,
            name=staff_data.name,
            email=staff_data.email,
            password_hash=password_hash,
            role=staff_data.role or "staff",
            active=True
        )
        
        db.add(staff)
        db.commit()
        db.refresh(staff)
        
        return staff
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error creating staff: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating staff: {str(e)}")


@router.get("/", response_model=List[StaffResponse])
def list_staff(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """List all staff/employees for the current business"""
    try:
        business_id = current["business"].id
        
        staff_list = db.query(Staff).filter(
            Staff.business_id == business_id
        ).order_by(Staff.created_at.desc()).all()
        
        # Return empty list if no staff found (this is normal)
        return staff_list
    except Exception as e:
        import traceback
        print(f"Error listing staff: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error listing staff: {str(e)}")


@router.put("/{staff_id}", response_model=StaffResponse)
def update_staff(
    staff_id: UUID,
    staff_data: StaffUpdate,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Update a staff member"""
    try:
        business_id = current["business"].id
        
        staff = db.query(Staff).filter(
            Staff.id == staff_id,
            Staff.business_id == business_id
        ).first()
        
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        # Update fields only if provided
        if staff_data.name is not None:
            staff.name = staff_data.name
        
        if staff_data.email is not None:
            # Check if email is being changed and if it's already taken
            if staff_data.email != staff.email:
                existing = db.query(Staff).filter(Staff.email == staff_data.email).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Email already in use")
            staff.email = staff_data.email
        
        if staff_data.role is not None:
            staff.role = staff_data.role
        
        # Update password if provided
        if staff_data.password:
            staff.password_hash = hash_password(staff_data.password)
        
        db.commit()
        db.refresh(staff)
        
        return staff
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error updating staff: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating staff: {str(e)}")


@router.delete("/{staff_id}")
def delete_staff(
    staff_id: UUID,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Deactivate a staff member (soft delete)"""
    business_id = current["business"].id
    
    staff = db.query(Staff).filter(
        Staff.id == staff_id,
        Staff.business_id == business_id
    ).first()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    # Soft delete - set active to False
    staff.active = False
    db.commit()
    
    return {"message": "Staff member deactivated successfully"}


@router.patch("/{staff_id}/activate")
def activate_staff(
    staff_id: UUID,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Reactivate a staff member"""
    business_id = current["business"].id
    
    staff = db.query(Staff).filter(
        Staff.id == staff_id,
        Staff.business_id == business_id
    ).first()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    staff.active = True
    db.commit()
    
    return {"message": "Staff member activated successfully"}

