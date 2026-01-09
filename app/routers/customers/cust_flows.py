from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import SessionLocal
from app.routers.customers.cust_models import Customer
from app.routers.customers.cust_schemas import CustomerCreate, CustomerResponse
from app.routers.rewards.points_models import PointsHistory
from app.routers.notifications.notification_service import queue_notification
from app.dependencies import get_current_business


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


SIGNUP_BONUS_DEFAULT = 5


@router.get("/lookup", response_model=CustomerResponse | None)
def lookup_customer(
    phone: str,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    """Lookup customer by phone for current business."""
    from uuid import UUID as _UUID

    business_id = current["business"].id
    customer = (
        db.query(Customer)
        .filter(Customer.business_id == business_id, Customer.phone == phone)
        .first()
    )
    return customer


@router.get("/all", response_model=list[CustomerResponse])
def list_customers(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    """List all customers for current business."""
    from uuid import UUID as _UUID

    business_id = current["business"].id
    customers = (
        db.query(Customer)
        .filter(Customer.business_id == business_id)
        .order_by(Customer.created_at.desc())
        .all()
    )
    return customers


@router.post("/", response_model=CustomerResponse)
def create_customer(
    payload: CustomerCreate,
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    """Register a new customer under current business, with optional signup bonus."""
    from uuid import UUID as _UUID

    business_id = current["business"].id

    existing = (
        db.query(Customer)
        .filter(Customer.business_id == business_id, Customer.phone == payload.phone)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Customer already exists")

    # Determine member status based on plan and membership_id
    # Member: plan is not N/A AND membership_id exists
    # Non-member: plan is N/A (regardless of membership_id)
    plan_value = payload.plan or "N/A"
    is_member = (plan_value.upper() != "N/A" and plan_value.upper() != "NA") and (payload.membership_id is not None and payload.membership_id.strip() != "")
    
    # If plan is N/A, customer is non-member (clear membership_id)
    if plan_value.upper() == "N/A" or plan_value.upper() == "NA":
        membership_id_value = None
    else:
        membership_id_value = payload.membership_id if payload.membership_id else None
    
    # Convert date_of_birth from date to datetime if provided
    dob_datetime = None
    if payload.date_of_birth:
        dob_datetime = datetime.combine(payload.date_of_birth, datetime.min.time())
    
    customer = Customer(
        business_id=business_id,
        phone=payload.phone,
        name=payload.name,
        email=str(payload.email) if payload.email else None,
        password_hash=None,  # Password will be set via email link
        membership_id=membership_id_value,
        plan=plan_value,
        date_of_birth=dob_datetime,
    )

    db.add(customer)
    db.flush()

    # Apply signup bonus if configured
    signup_bonus = SIGNUP_BONUS_DEFAULT
    if signup_bonus > 0:
        # Use ledger system
        from app.routers.rewards.points_ledger_service import add_points_to_ledger
        add_points_to_ledger(
            db=db,
            customer_id=customer.id,
            points_earned=signup_bonus,
            reward_type_applied="POINTS"
        )
        
        # Also keep old PointsHistory for backward compatibility
        history = PointsHistory(
            customer_id=customer.id,
            business_id=business_id,
            points=signup_bonus,
            reason="signup_bonus",
        )
        db.add(history)

    # Send welcome email if email provided
    if customer.email:
        try:
            from app.routers.notifications.email_service import email_service
            import uuid
            # Generate a secure token for password setup
            password_setup_token = str(uuid.uuid4())
            # Store token temporarily (in production, use Redis or database with expiration)
            # For now, we'll include it in the email
            email_service.send_welcome_email(
                customer_name=customer.name or "Customer",
                customer_email=customer.email,
                signup_bonus=signup_bonus,
                password_setup_token=password_setup_token
            )
        except Exception as e:
            # Log error but don't fail customer creation
            import logging
            logging.error(f"Error sending welcome email: {str(e)}")
        
        # Also queue notification for tracking
        queue_notification(
            db,
            customer_id=customer.id,
            channel="email",
            type="welcome",
            payload={"email": customer.email, "name": customer.name, "signup_bonus": signup_bonus},
        )

    # Queue SMS notification
    queue_notification(
        db,
        customer_id=customer.id,
        channel="sms",
        type="welcome",
        payload={"phone": customer.phone, "signup_bonus": signup_bonus},
    )

    db.commit()
    db.refresh(customer)
    return customer


