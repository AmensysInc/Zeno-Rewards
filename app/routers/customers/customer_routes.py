from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, String, and_, or_
from uuid import UUID
from typing import List

from app.database import SessionLocal
from app.dependencies import get_current_customer
from app.routers.customers.cust_models import Customer
from app.routers.transactions.transaction_models import Transaction
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.points_ledger_models import PointBalance
from app.routers.rewards.points_ledger_service import get_customer_balance

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard")
def get_customer_dashboard(
    current: dict = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """Get customer dashboard data with transactions and redeemable offers"""
    customer = current["customer"]
    business_id = customer.business_id
    
    # Get point balance
    points = get_customer_balance(db, customer.id)
    
    # Count transactions
    transaction_count = db.query(func.count(Transaction.id)).filter(
        Transaction.business_id == business_id,
        Transaction.phone_number == customer.phone,
        Transaction.is_approved == True
    ).scalar() or 0
    
    # Count offers (filtered by customer type)
    is_member = customer.membership_id is not None and customer.membership_id != ''
    customer_type_filter = 'MEMBER' if is_member else 'NON_MEMBER'
    
    offers_query = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True
    )
    
    # Filter by customer type (MEMBER, NON_MEMBER, or ANY)
    from sqlalchemy import or_
    offers_query = offers_query.filter(
        or_(
            Offer.customer_type == 'ANY',
            Offer.customer_type == customer_type_filter
        )
    )
    
    # Check date validity
    from datetime import date
    today = date.today()
    offers_query = offers_query.filter(
        Offer.start_date <= today,
        or_(
            Offer.end_date.is_(None),
            Offer.end_date >= today
        )
    )
    
    offers_count = offers_query.count()
    
    # Get all transactions (not just recent)
    all_transactions = db.query(Transaction).filter(
        Transaction.business_id == business_id,
        Transaction.phone_number == customer.phone,
        Transaction.is_approved == True
    ).order_by(Transaction.date.desc()).all()
    
    transactions_data = []
    for trans in all_transactions:
        transactions_data.append({
            "id": str(trans.id),
            "date": trans.date.isoformat(),
            "description": trans.description,
            "quantity": trans.quantity,
            "amount": float(trans.amount) if trans.amount else 0,
            "discount_amount": float(trans.discount_amount) if trans.discount_amount else 0,
            "license_plate": trans.license_plate,
            "transaction_sequence": trans.transaction_sequence
        })
    
    # Get redeemable offers
    from app.routers.rewards.redeemable_offer_service import get_customer_redeemable_offers
    from app.routers.rewards.redeemable_offer_schemas import RedeemableOfferResponse
    
    redeemable_offers = get_customer_redeemable_offers(db, customer.id, business_id, include_redeemed=False)
    redeemable_offers_data = []
    for offer in redeemable_offers:
        redeemable_offers_data.append({
            "id": str(offer.id),
            "customer_type": offer.customer_type,
            "reward_type": offer.reward_type,
            "reward_value": offer.reward_value,
            "created_at": offer.created_at.isoformat(),
            "rule_id": str(offer.rule_id) if offer.rule_id else None
        })
    
    return {
        "customer": {
            "id": str(customer.id),
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "membership_id": customer.membership_id,
            "is_member": is_member
        },
        "points": points,
        "transaction_count": transaction_count,
        "offers_count": offers_count,
        "transactions": transactions_data,
        "redeemable_offers": redeemable_offers_data
    }


@router.get("/points")
def get_customer_points(
    current: dict = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """Get customer points information with next reward unlock details"""
    customer = current["customer"]
    business_id = customer.business_id
    
    # Get current point balance
    points = get_customer_balance(db, customer.id)
    
    # Get all active offers that require points
    is_member = customer.membership_id is not None and customer.membership_id != ''
    customer_type_filter = 'MEMBER' if is_member else 'NON_MEMBER'
    
    from sqlalchemy import or_
    from datetime import date
    today = date.today()
    
    offers_query = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True,
        Offer.reward_type == 'POINTS',  # Only point-based rewards for now
        Offer.start_date <= today,
        or_(
            Offer.end_date.is_(None),
            Offer.end_date >= today
        ),
        or_(
            Offer.customer_type == 'ANY',
            Offer.customer_type == customer_type_filter
        )
    ).order_by(Offer.priority.desc())
    
    all_offers = offers_query.all()
    
    # Find next unlockable offer
    next_offer = None
    points_needed = 0
    
    for offer in all_offers:
        try:
            required_points = int(offer.reward_value)
            if points < required_points:
                if next_offer is None or required_points < int(next_offer.reward_value):
                    next_offer = offer
                    points_needed = required_points - points
        except (ValueError, TypeError):
            continue
    
    # Get points ledger for history
    from app.routers.rewards.points_ledger_models import PointsLedger
    ledger_entries = db.query(PointsLedger).filter(
        PointsLedger.customer_id == customer.id
    ).order_by(PointsLedger.created_at.desc()).limit(20).all()
    
    ledger_data = []
    for entry in ledger_entries:
        ledger_data.append({
            "id": str(entry.points_id),
            "points_earned": entry.points_earned,
            "reward_type": entry.reward_type_applied,
            "created_at": entry.created_at.isoformat(),
            "transaction_id": str(entry.transaction_id) if entry.transaction_id else None,
            "rule_id": str(entry.rule_id) if entry.rule_id else None
        })
    
    return {
        "current_points": points,
        "next_offer": {
            "id": str(next_offer.id) if next_offer else None,
            "name": next_offer.name if next_offer else None,
            "description": next_offer.description if next_offer else None,
            "points_needed": points_needed,
            "required_points": int(next_offer.reward_value) if next_offer else None
        } if next_offer else None,
        "points_history": ledger_data
    }


@router.get("/offers")
def get_customer_offers(
    current: dict = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """Get offers available to the customer"""
    customer = current["customer"]
    business_id = customer.business_id
    
    # Determine customer type
    is_member = customer.membership_id is not None and customer.membership_id != ''
    customer_type_filter = 'MEMBER' if is_member else 'NON_MEMBER'
    
    from sqlalchemy import or_
    from datetime import date
    today = date.today()
    
    # Get offers that match customer type
    # EXCLUDE 5th wash offers - they should only appear as redeemable offers after 4 washes
    from sqlalchemy import func
    
    # Build base query
    base_query = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True,
        Offer.start_date <= today,
        or_(
            Offer.end_date.is_(None),
            Offer.end_date >= today
        ),
        or_(
            Offer.customer_type == 'ANY',
            Offer.customer_type == customer_type_filter
        )
    )
    
    # Exclude 5th wash offers at the SQL level
    if customer_type_filter == 'MEMBER':
        # Exclude Member 5th wash: DISCOUNT_PERCENT with 20% value
        base_query = base_query.filter(
            ~or_(
                and_(
                    Offer.reward_type == 'DISCOUNT_PERCENT',
                    or_(
                        Offer.reward_value == '20',
                        Offer.reward_value == '20.0',
                        func.cast(Offer.reward_value, String).like('%20%')
                    )
                ),
                func.lower(Offer.name).like('%5th%'),
                func.lower(Offer.name).like('%fifth%')
            )
        )
    else:
        # Exclude Non-member 5th wash: FREE_WASH or name contains "5th"
        base_query = base_query.filter(
            ~or_(
                Offer.reward_type == 'FREE_WASH',
                func.lower(Offer.name).like('%5th%'),
                func.lower(Offer.name).like('%fifth%')
            )
        )
    
    offers = base_query.order_by(Offer.priority.desc(), Offer.created_at.desc()).all()
    
    # Offers are already filtered at SQL level - no need for Python-level filtering
    offers_data = []
    for offer in offers:
        offers_data.append({
            "id": str(offer.id),
            "name": offer.name,
            "description": offer.description,
            "reward_type": offer.reward_type,
            "reward_value": offer.reward_value,
            "per_unit": offer.per_unit,
            "customer_type": offer.customer_type,
            "wash_type": offer.wash_type,
            "start_date": offer.start_date.isoformat() if offer.start_date else None,
            "end_date": offer.end_date.isoformat() if offer.end_date else None,
            "priority": offer.priority,
            "max_uses_per_customer": offer.max_uses_per_customer
        })
    
    return {
        "customer_type": customer_type_filter,
        "is_member": is_member,
        "offers": offers_data
    }

