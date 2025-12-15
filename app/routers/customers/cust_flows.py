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

    business_id = _UUID(current["user"]["business_id"])
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

    business_id = _UUID(current["user"]["business_id"])
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

    business_id = _UUID(current["user"]["business_id"])

    existing = (
        db.query(Customer)
        .filter(Customer.business_id == business_id, Customer.phone == payload.phone)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Customer already exists")

    customer = Customer(
        business_id=business_id,
        phone=payload.phone,
        name=payload.name,
        email=str(payload.email) if payload.email else None,
    )

    # Apply signup bonus if configured
    signup_bonus = SIGNUP_BONUS_DEFAULT
    if signup_bonus > 0:
        customer.points = (customer.points or 0) + signup_bonus

    db.add(customer)
    db.flush()

    if signup_bonus > 0:
        history = PointsHistory(
            customer_id=customer.id,
            business_id=business_id,
            points=signup_bonus,
            reason="signup_bonus",
        )
        db.add(history)

    # Queue welcome notifications (email / sms) if contact info provided
    if customer.email:
        queue_notification(
            db,
            customer_id=customer.id,
            channel="email",
            type="welcome",
            payload={"email": customer.email, "name": customer.name, "signup_bonus": signup_bonus},
        )

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


