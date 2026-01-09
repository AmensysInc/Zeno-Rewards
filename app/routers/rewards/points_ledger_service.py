from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.routers.rewards.points_ledger_models import PointsLedger, PointBalance


def add_points_to_ledger(
    db: Session,
    customer_id: UUID,
    points_earned: int,
    reward_type_applied: str,
    transaction_id: UUID = None,
    rule_id: UUID = None,
    member_id: UUID = None
) -> PointsLedger:
    """Add an entry to the points ledger and update the balance."""
    
    # Create ledger entry
    ledger_entry = PointsLedger(
        member_id=member_id,
        customer_id=customer_id,
        transaction_id=transaction_id,
        rule_id=rule_id,
        points_earned=points_earned,
        reward_type_applied=reward_type_applied
    )
    db.add(ledger_entry)
    
    # Update or create balance
    balance = db.query(PointBalance).filter(PointBalance.customer_id == customer_id).first()
    if balance:
        balance.total_points = (balance.total_points or 0) + points_earned
        balance.last_updated_at = datetime.utcnow()
    else:
        balance = PointBalance(
            customer_id=customer_id,
            total_points=points_earned
        )
        db.add(balance)
    
    # Also update customer.points for backward compatibility
    from app.routers.customers.cust_models import Customer
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer:
        customer.points = (customer.points or 0) + points_earned
    
    db.flush()
    return ledger_entry


def get_customer_balance(db: Session, customer_id: UUID) -> int:
    """Get the current point balance for a customer."""
    balance = db.query(PointBalance).filter(PointBalance.customer_id == customer_id).first()
    if balance:
        return balance.total_points or 0
    
    # Fallback to customer.points if balance doesn't exist
    from app.routers.customers.cust_models import Customer
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer:
        return customer.points or 0
    
    return 0

