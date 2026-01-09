from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, date as date_type
import uuid as _uuid

from app.database import SessionLocal
from app.dependencies import get_current_business
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.offers_schemas import OfferCreate, OfferResponse
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


@router.post("/offers/create", response_model=OfferResponse)
def create_offer(
    payload: OfferCreate,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = current["business"].id
    
    # Calculate points_required from reward_value if reward_type is POINTS
    points_required = None
    if payload.reward_type == "POINTS":
        try:
            points_required = int(payload.reward_value)
        except ValueError:
            points_required = 0
    
    offer = Offer(
        business_id=business_id,
        name=payload.name,
        description=payload.description,
        customer_type=payload.customer_type,
        product_type=payload.product_type,
        wash_type=payload.wash_type,
        membership_term=payload.membership_term,
        reward_type=payload.reward_type,
        reward_value=payload.reward_value,
        per_unit=payload.per_unit,
        priority=payload.priority,
        max_uses_per_customer=payload.max_uses_per_customer,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_active=payload.is_active,
        # Backward compatibility fields
        title=payload.name,  # Alias
        category=payload.wash_type,  # Alias
        points_required=points_required,
        status="Active" if payload.is_active else "Inactive",
        expiry_date=datetime.combine(payload.end_date, datetime.min.time()) if payload.end_date else None,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    
    # Send email notifications to eligible customers if offer is active
    if offer.is_active:
        try:
            from app.routers.notifications.email_service import email_service
            from sqlalchemy import or_
            from datetime import date
            
            # Get eligible customers based on customer_type
            customer_type_filter = offer.customer_type
            today = date.today()
            
            # Check if offer is currently valid
            if offer.start_date <= today and (offer.end_date is None or offer.end_date >= today):
                # Get customers matching the offer criteria
                customers_query = db.query(Customer).filter(
                    Customer.business_id == business_id
                )
                
                if customer_type_filter == 'MEMBER':
                    customers_query = customers_query.filter(
                        Customer.membership_id.isnot(None),
                        Customer.membership_id != ''
                    )
                elif customer_type_filter == 'NON_MEMBER':
                    customers_query = customers_query.filter(
                        or_(
                            Customer.membership_id.is_(None),
                            Customer.membership_id == ''
                        )
                    )
                # If 'ANY', no additional filter needed
                
                # Only get customers with email
                customers_query = customers_query.filter(Customer.email.isnot(None), Customer.email != '')
                
                eligible_customers = customers_query.all()
                
                # Send email to each eligible customer
                for customer in eligible_customers:
                    try:
                        email_service.send_offer_notification_email(
                            customer_name=customer.name or "Valued Customer",
                            customer_email=customer.email,
                            offer_name=offer.name,
                            offer_description=offer.description,
                            reward_type=offer.reward_type,
                            reward_value=str(offer.reward_value)
                        )
                    except Exception as e:
                        # Log error but continue with other customers
                        import logging
                        logging.error(f"Error sending offer email to {customer.email}: {str(e)}")
        except Exception as e:
            # Log error but don't fail offer creation
            import logging
            logging.error(f"Error sending offer notifications: {str(e)}")
    
    return offer


@router.get("/offers", response_model=list[OfferResponse])
def get_offers(
    status: str = None,  # Filter by status: Active or Inactive
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = current["business"].id
    query = db.query(Offer).filter(Offer.business_id == business_id)
    
    # Filter by status if provided
    if status == "Active":
        query = query.filter(Offer.is_active == True)
    elif status == "Inactive":
        query = query.filter(Offer.is_active == False)
    
    # For expired offers, check end_date
    if status == "Expired":
        query = query.filter(Offer.end_date < date_type.today())
    
    offers = query.order_by(Offer.priority.desc(), Offer.start_date.desc() if Offer.start_date else Offer.created_at.desc()).all()
    return offers


@router.get("/earning-rules", response_model=list[EarningRuleResponse])
def list_earning_rules(
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = current["business"].id
    rules = db.query(EarningRule).filter(EarningRule.business_id == business_id).all()
    return rules


@router.post("/earning-rules", response_model=EarningRuleResponse)
def create_earning_rule(
    payload: EarningRuleCreate,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = current["business"].id
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
    business_id = current["business"].id
    customer_uuid = UUID(customer_id)

    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_uuid, Customer.business_id == business_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    offers = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True
    ).all()
    
    # Filter eligible offers based on customer points and reward type
    from app.routers.rewards.points_ledger_service import get_customer_balance
    customer_balance = get_customer_balance(db, customer.id)
    
    eligible = []
    for o in offers:
        if o.reward_type == "POINTS":
            try:
                points_needed = int(o.reward_value)
                if customer_balance >= points_needed:
                    eligible.append(o)
            except ValueError:
                pass
        else:
            # For other reward types, include them (logic can be extended later)
            eligible.append(o)
    
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
    business_id = current["business"].id
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

    # Check if customer has enough points for POINTS reward type
    points_needed = 0
    if offer.reward_type == "POINTS":
        try:
            points_needed = int(offer.reward_value)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid reward value")
        
        from app.routers.rewards.points_ledger_service import get_customer_balance
        customer_balance = get_customer_balance(db, customer.id)
        
        if customer_balance < points_needed:
            raise HTTPException(status_code=400, detail="Insufficient points")
    
    # Deduct points if reward type is POINTS
    if offer.reward_type == "POINTS":
        # Use ledger system (negative points for redemption)
        from app.routers.rewards.points_ledger_service import add_points_to_ledger
        add_points_to_ledger(
            db=db,
            customer_id=customer.id,
            points_earned=-points_needed,
            reward_type_applied=offer.reward_type,
            rule_id=offer.id
        )
        
        # Also keep old PointsHistory for backward compatibility
        history = PointsHistory(
            customer_id=customer.id,
            business_id=business_id,
            points=-points_needed,
            reason="redeem",
        )
        db.add(history)
    redemption = Redemption(
        customer_id=customer.id,
        offer_id=offer.id,
        business_id=business_id,
        points_used=points_needed if offer.reward_type == "POINTS" else 0,
        redemption_code=_generate_redemption_code(),
    )
    db.add(redemption)

    # Send redemption confirmation email
    if customer.email:
        try:
            from app.routers.notifications.email_service import email_service
            email_service.send_redemption_confirmation_email(
                customer_name=customer.name or "Customer",
                customer_email=customer.email,
                offer_name=offer.name or offer.title or "Offer",
                reward_type=offer.reward_type,
                reward_value=str(offer.reward_value),
                redemption_code=redemption.redemption_code
            )
        except Exception as e:
            # Log error but don't fail redemption
            import logging
            logging.error(f"Error sending redemption email: {str(e)}")
        
        # Also queue notification for tracking
        queue_notification(
            db,
            customer_id=customer.id,
            channel="email",
            type="redeem",
            payload={
                "email": customer.email,
                "name": customer.name,
                "offer_title": offer.name or offer.title,
                "redemption_code": redemption.redemption_code,
            },
        )

    # Queue SMS notification
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
