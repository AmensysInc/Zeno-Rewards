from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from app.routers.rewards.redeemable_offer_models import RedeemableOffer
from app.routers.transactions.transaction_models import Transaction
from app.routers.customers.cust_models import Customer
from app.routers.rewards.offers_models import Offer


def get_customer_transaction_count(db: Session, customer_id: UUID, business_id: UUID) -> int:
    """Get the count of approved transactions for a customer"""
    count = db.query(func.count(Transaction.id)).filter(
        Transaction.business_id == business_id,
        Transaction.phone_number == db.query(Customer.phone).filter(Customer.id == customer_id).scalar_subquery(),
        Transaction.is_approved == True
    ).scalar() or 0
    return count


def get_customer_transaction_count_by_phone(db: Session, phone_number: str, business_id: UUID) -> int:
    """Get the count of approved transactions for a customer by phone number"""
    count = db.query(func.count(Transaction.id)).filter(
        Transaction.business_id == business_id,
        Transaction.phone_number == phone_number,
        Transaction.is_approved == True
    ).scalar() or 0
    return count


def check_and_create_redeemable_offer(
    db: Session,
    customer: Customer,
    transaction: Transaction,
    business_id: UUID
) -> Optional[RedeemableOffer]:
    """
    Check if customer completed 4th transaction and create redeemable offer.
    Returns the created offer or None if not eligible.
    """
    # Check if customer is member or non-member
    is_member = customer.membership_id is not None and customer.membership_id != ''
    customer_type = 'MEMBER' if is_member else 'NON_MEMBER'
    
    # Get transaction count (including this one)
    transaction_count = get_customer_transaction_count_by_phone(
        db, customer.phone, business_id
    )
    
    # Only create offer after 4th transaction
    if transaction_count != 4:
        return None
    
    # Check if offer already exists for this customer (not redeemed)
    existing_offer = db.query(RedeemableOffer).filter(
        RedeemableOffer.customer_id == customer.id,
        RedeemableOffer.business_id == business_id,
        RedeemableOffer.is_redeemed == False,
        RedeemableOffer.customer_type == customer_type
    ).first()
    
    if existing_offer:
        return existing_offer
    
    # Find the appropriate rule
    rule = None
    if customer_type == 'MEMBER':
        # Member: 20% discount on 5th wash
        rule = db.query(Offer).filter(
            Offer.business_id == business_id,
            Offer.customer_type == 'MEMBER',
            Offer.reward_type == 'DISCOUNT_PERCENT',
            Offer.is_active == True
        ).first()
        reward_type = 'DISCOUNT_PERCENT'
        reward_value = '20'  # 20% discount
    else:
        # Non-member: 5th wash free
        rule = db.query(Offer).filter(
            Offer.business_id == business_id,
            Offer.customer_type == 'NON_MEMBER',
            Offer.is_active == True
        ).first()
        reward_type = 'FREE_WASH'
        reward_value = 'FREE'
    
    # Create redeemable offer
    redeemable_offer = RedeemableOffer(
        customer_id=customer.id,
        business_id=business_id,
        rule_id=rule.id if rule else None,
        customer_type=customer_type,
        reward_type=reward_type,
        reward_value=reward_value,
        trigger_transaction_id=transaction.id,
        is_redeemed=False
    )
    
    db.add(redeemable_offer)
    db.flush()
    return redeemable_offer


def get_customer_redeemable_offers(
    db: Session,
    customer_id: UUID,
    business_id: UUID,
    include_redeemed: bool = False
) -> List[RedeemableOffer]:
    """Get all redeemable offers for a customer"""
    query = db.query(RedeemableOffer).filter(
        RedeemableOffer.customer_id == customer_id,
        RedeemableOffer.business_id == business_id
    )
    
    if not include_redeemed:
        query = query.filter(RedeemableOffer.is_redeemed == False)
    
    return query.order_by(RedeemableOffer.created_at.desc()).all()


def mark_offer_as_redeemed(
    db: Session,
    redeemable_offer_id: UUID,
    transaction_id: UUID
) -> RedeemableOffer:
    """Mark a redeemable offer as redeemed"""
    offer = db.query(RedeemableOffer).filter(
        RedeemableOffer.id == redeemable_offer_id
    ).first()
    
    if not offer:
        raise ValueError("Redeemable offer not found")
    
    if offer.is_redeemed:
        raise ValueError("Offer already redeemed")
    
    offer.is_redeemed = True
    offer.redeemed_at = datetime.utcnow()
    offer.redeemed_transaction_id = transaction_id
    
    db.flush()
    return offer

