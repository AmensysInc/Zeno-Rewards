from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from app.database import SessionLocal
from app.dependencies import get_current_business
from app.routers.customers.cust_models import Customer
from app.routers.rewards.redeemable_offer_service import get_customer_redeemable_offers
from app.routers.rewards.points_ledger_service import get_customer_balance
from app.routers.transactions.transaction_models import Transaction
from sqlalchemy import func

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CustomerRewardsInfo(BaseModel):
    customer: dict
    points_balance: int
    transaction_count: int
    redeemable_offers: List[dict]
    is_member: bool


@router.get("/lookup/{phone}", response_model=CustomerRewardsInfo)
def lookup_customer_rewards(
    phone: str,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Lookup customer by phone and get their rewards information (for staff)"""
    try:
        business_id = current["business"].id
    except (KeyError, AttributeError) as e:
        import traceback
        print(f"Error accessing business: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error accessing business information: {str(e)}")
    
    try:
        # Find customer
        customer = db.query(Customer).filter(
            Customer.business_id == business_id,
            Customer.phone == phone
        ).first()
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get points balance
        try:
            points_balance = get_customer_balance(db, customer.id)
        except Exception as e:
            print(f"Error getting points balance: {e}")
            points_balance = customer.points or 0
        
        # Get transaction count
        try:
            transaction_count = db.query(func.count(Transaction.id)).filter(
                Transaction.business_id == business_id,
                Transaction.phone_number == customer.phone,
                Transaction.is_approved == True
            ).scalar() or 0
        except Exception as e:
            print(f"Error getting transaction count: {e}")
            transaction_count = 0
        
        # Get redeemable offers
        try:
            redeemable_offers_list = get_customer_redeemable_offers(
                db, customer.id, business_id, include_redeemed=False
            )
        except Exception as e:
            print(f"Error getting redeemable offers: {e}")
            import traceback
            print(traceback.format_exc())
            redeemable_offers_list = []
        
        # Format redeemable offers
        redeemable_offers_data = []
        for offer in redeemable_offers_list:
            try:
                redeemable_offers_data.append({
                    "id": str(offer.id),
                    "customer_type": getattr(offer, 'customer_type', 'UNKNOWN'),
                    "reward_type": getattr(offer, 'reward_type', 'UNKNOWN'),
                    "reward_value": str(getattr(offer, 'reward_value', '0')),
                    "is_redeemed": getattr(offer, 'is_redeemed', False),
                    "created_at": offer.created_at.isoformat() if hasattr(offer, 'created_at') and offer.created_at else None
                })
            except Exception as e:
                print(f"Error formatting offer {getattr(offer, 'id', 'unknown')}: {e}")
                import traceback
                print(traceback.format_exc())
                continue
        
        # Determine if member
        is_member = False
        if customer.plan and customer.plan.upper() not in ("N/A", "NA"):
            if customer.membership_id:
                membership_id_str = str(customer.membership_id).strip()
                is_member = membership_id_str != ""
        
        return {
            "customer": {
                "id": str(customer.id),
                "name": customer.name,
                "phone": customer.phone,
                "email": customer.email,
                "plan": customer.plan,
                "membership_id": customer.membership_id,
                "points": customer.points or 0
            },
            "points_balance": points_balance,
            "transaction_count": transaction_count,
            "redeemable_offers": redeemable_offers_data,
            "is_member": is_member
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in lookup_customer_rewards: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

