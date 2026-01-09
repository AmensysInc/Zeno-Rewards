from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from datetime import datetime, date

from app.database import SessionLocal
from app.dependencies import get_current_business
from app.routers.rewards.points_ledger_models import PointsLedger, PointBalance
from app.routers.rewards.points_ledger_schemas import PointsLedgerResponse, PointBalanceResponse
from app.routers.customers.cust_models import Customer

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/points/ledger", response_model=List[PointsLedgerResponse])
def get_points_ledger(
    customer_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Get points ledger entries for the business."""
    business_id = current["business"].id
    
    # Get all customer IDs for this business
    customer_ids = [c.id for c in db.query(Customer.id).filter(Customer.business_id == business_id).all()]
    
    query = db.query(PointsLedger).filter(
        (PointsLedger.customer_id.in_(customer_ids)) | (PointsLedger.member_id.in_(customer_ids))
    )
    
    if customer_id:
        customer_uuid = UUID(customer_id)
        query = query.filter(
            (PointsLedger.customer_id == customer_uuid) | (PointsLedger.member_id == customer_uuid)
        )
    
    ledger_entries = query.order_by(PointsLedger.created_at.desc()).offset(offset).limit(limit).all()
    return ledger_entries


@router.get("/points/balances", response_model=List[PointBalanceResponse])
def get_point_balances(
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Get point balances for customers in the business."""
    business_id = current["business"].id
    
    query = db.query(PointBalance).join(
        Customer, PointBalance.customer_id == Customer.id
    ).filter(Customer.business_id == business_id)
    
    if customer_id:
        customer_uuid = UUID(customer_id)
        query = query.filter(PointBalance.customer_id == customer_uuid)
    
    balances = query.order_by(PointBalance.last_updated_at.desc()).all()
    return balances


@router.get("/points/balance/{customer_id}", response_model=PointBalanceResponse)
def get_customer_balance(
    customer_id: str,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Get point balance for a specific customer."""
    business_id = current["business"].id
    customer_uuid = UUID(customer_id)
    
    # Verify customer belongs to business
    customer = db.query(Customer).filter(
        Customer.id == customer_uuid,
        Customer.business_id == business_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    balance = db.query(PointBalance).filter(PointBalance.customer_id == customer_uuid).first()
    
    # If balance doesn't exist, create one from customer.points
    if not balance:
        balance = PointBalance(
            customer_id=customer_uuid,
            total_points=customer.points or 0
        )
        db.add(balance)
        db.commit()
        db.refresh(balance)
    
    return balance


@router.get("/points/ledger/{customer_id}", response_model=List[PointsLedgerResponse])
def get_customer_ledger(
    customer_id: str,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Get points ledger entries for a specific customer."""
    business_id = current["business"].id
    customer_uuid = UUID(customer_id)
    
    # Verify customer belongs to business
    customer = db.query(Customer).filter(
        Customer.id == customer_uuid,
        Customer.business_id == business_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    ledger_entries = db.query(PointsLedger).filter(
        (PointsLedger.customer_id == customer_uuid) | (PointsLedger.member_id == customer_uuid)
    ).order_by(PointsLedger.created_at.desc()).offset(offset).limit(limit).all()
    
    return ledger_entries

