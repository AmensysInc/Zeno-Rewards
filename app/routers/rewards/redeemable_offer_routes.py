from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database import SessionLocal
from app.dependencies import get_current_customer, get_current_business
from app.routers.rewards.redeemable_offer_models import RedeemableOffer
from app.routers.rewards.redeemable_offer_schemas import RedeemableOfferResponse, RedeemOfferRequest
from app.routers.rewards.redeemable_offer_service import (
    get_customer_redeemable_offers,
    mark_offer_as_redeemed,
    get_customer_transaction_count_by_phone
)
from app.routers.customers.cust_models import Customer
from app.routers.transactions.transaction_models import Transaction

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/customer/redeemable-offers", response_model=List[RedeemableOfferResponse])
def get_my_redeemable_offers(
    current: dict = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """Get all unredeemed offers for the current customer"""
    customer = current["customer"]
    business_id = customer.business_id
    
    offers = get_customer_redeemable_offers(db, customer.id, business_id, include_redeemed=False)
    return offers


@router.post("/customer/redeem-offer")
def redeem_offer(
    request: RedeemOfferRequest,
    current: dict = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """Customer redeems an offer (marks it for redemption, will be applied on next transaction)"""
    customer = current["customer"]
    business_id = customer.business_id
    
    # Verify the offer belongs to this customer
    offer = db.query(RedeemableOffer).filter(
        RedeemableOffer.id == request.redeemable_offer_id,
        RedeemableOffer.customer_id == customer.id,
        RedeemableOffer.business_id == business_id,
        RedeemableOffer.is_redeemed == False
    ).first()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Redeemable offer not found or already redeemed")
    
    # Check transaction count - should be 4 (offer created) or more
    transaction_count = get_customer_transaction_count_by_phone(
        db, customer.phone, business_id
    )
    
    if transaction_count < 4:
        raise HTTPException(
            status_code=400,
            detail="You need to complete 4 transactions before redeeming this offer"
        )
    
    # The offer will be marked as redeemed when the 5th transaction is processed
    # with discount/0 amount. For now, we just return success.
    # The actual redemption happens during transaction approval.
    
    return {
        "message": "Offer marked for redemption. It will be applied on your next (5th) transaction.",
        "redeemable_offer_id": str(offer.id),
        "reward_type": offer.reward_type,
        "reward_value": offer.reward_value,
        "transaction_count": transaction_count,
        "next_transaction": transaction_count + 1
    }


@router.get("/business/customer/{customer_id}/redeemable-offers", response_model=List[RedeemableOfferResponse])
def get_customer_redeemable_offers_for_business(
    customer_id: str,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    """Business view: Get all redeemable offers for a customer"""
    business_id = current["business"].id
    customer_uuid = UUID(customer_id)
    
    # Verify customer belongs to business
    customer = db.query(Customer).filter(
        Customer.id == customer_uuid,
        Customer.business_id == business_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    offers = get_customer_redeemable_offers(db, customer_uuid, business_id, include_redeemed=True)
    return offers

