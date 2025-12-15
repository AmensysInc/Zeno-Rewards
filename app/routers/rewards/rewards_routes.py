from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
import uuid as _uuid

from app.database import SessionLocal
from app.dependencies import get_current_business
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.redemption_models import Redemption
from app.routers.rewards.points_models import PointsHistory, EarningRule
from app.routers.rewards.points_schemas import EarningRuleCreate, EarningRuleResponse
from app.routers.customers.cust_models import Customer
from app.routers.notifications.notification_service import queue_notification

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/offers/create")
def create_offer(
    title: str,
    category: str,
    price: float,
    points_required: int,
    status: str = "Active",
    start_date: str = None,
    end_date: str = None,
    description: str = None,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = UUID(current["user"]["business_id"])
    
    # Parse date strings to datetime objects
    start_date_obj = None
    end_date_obj = None
    if start_date:
        try:
            start_date_obj = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        try:
            end_date_obj = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
    
    offer = Offer(
        business_id=business_id,
        title=title,
        category=category,
        price=price,
        points_required=points_required,
        status=status,
        start_date=start_date_obj,
        expiry_date=end_date_obj,
        description=description,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


@router.get("/offers")
def get_offers(
    status: str = None,  # Filter by status: Active or Inactive
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = UUID(current["user"]["business_id"])
    query = db.query(Offer).filter(Offer.business_id == business_id)
    
    # Filter by status if provided
    if status:
        query = query.filter(Offer.status == status)
    
    # For expired offers, check expiry_date
    if status == "Expired":
        from datetime import datetime
        query = query.filter(Offer.expiry_date < datetime.utcnow())
    
    offers = query.order_by(Offer.start_date.desc() if Offer.start_date else Offer.created_at.desc()).all()
    return offers


@router.get("/earning-rules", response_model=list[EarningRuleResponse])
def list_earning_rules(
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = UUID(current["user"]["business_id"])
    rules = db.query(EarningRule).filter(EarningRule.business_id == business_id).all()
    return rules


@router.post("/earning-rules", response_model=EarningRuleResponse)
def create_earning_rule(
    payload: EarningRuleCreate,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = UUID(current["user"]["business_id"])
    rule = EarningRule(
        business_id=business_id,
        rule_name=payload.rule_name,
        rule_type=payload.rule_type,
        points_awarded=payload.points_awarded,
        conditions=payload.conditions,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("/eligible/{customer_id}")
def get_eligible_offers(
    customer_id: str,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = UUID(current["user"]["business_id"])
    customer_uuid = UUID(customer_id)

    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_uuid, Customer.business_id == business_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    offers = db.query(Offer).filter(Offer.business_id == business_id).all()
    eligible = [o for o in offers if customer.points >= o.points_required]
    return eligible


def _generate_redemption_code() -> str:
    return _uuid.uuid4().hex[:10].upper()


@router.post("/redeem/{customer_id}/{offer_id}")
def redeem_offer(
    customer_id: str,
    offer_id: str,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = UUID(current["user"]["business_id"])
    customer_uuid = UUID(customer_id)
    offer_uuid = UUID(offer_id)

    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_uuid, Customer.business_id == business_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    offer = (
        db.query(Offer)
        .filter(Offer.id == offer_uuid, Offer.business_id == business_id)
        .first()
    )
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if customer.points < offer.points_required:
        raise HTTPException(status_code=400, detail="Insufficient points")

    # Deduct points
    customer.points -= offer.points_required
    history = PointsHistory(
        customer_id=customer.id,
        business_id=business_id,
        points=-offer.points_required,
        reason="redeem",
    )
    db.add(history)

    redemption = Redemption(
        customer_id=customer.id,
        offer_id=offer.id,
        business_id=business_id,
        points_used=offer.points_required,
        redemption_code=_generate_redemption_code(),
    )
    db.add(redemption)

    # Queue notification for redemption (email + sms)
    if customer.email:
        queue_notification(
            db,
            customer_id=customer.id,
            channel="email",
            type="redeem",
            payload={
                "email": customer.email,
                "name": customer.name,
                "offer_title": offer.title,
                "redemption_code": redemption.redemption_code,
            },
        )

    queue_notification(
        db,
        customer_id=customer.id,
        channel="sms",
        type="redeem",
        payload={
            "phone": customer.phone,
            "offer_title": offer.title,
            "redemption_code": redemption.redemption_code,
        },
    )

    db.commit()
    db.refresh(redemption)

    return {
        "redemption_id": str(redemption.id),
        "redemption_code": redemption.redemption_code,
        "points_used": redemption.points_used,
    }
