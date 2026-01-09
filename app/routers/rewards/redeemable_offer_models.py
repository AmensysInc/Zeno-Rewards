from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base


class RedeemableOffer(Base):
    """Tracks offers available for customer redemption (created after 4th transaction)"""
    __tablename__ = "redeemable_offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=True)  # Reference to the rule
    
    # Offer details
    customer_type = Column(String(20), nullable=False)  # MEMBER or NON_MEMBER
    reward_type = Column(String(30), nullable=False)  # DISCOUNT_PERCENT or FREE_WASH
    reward_value = Column(String(50), nullable=False)  # e.g., "20" for 20% discount or "FREE" for free wash
    
    # Status tracking
    is_redeemed = Column(Boolean, default=False)
    redeemed_at = Column(DateTime, nullable=True)
    redeemed_transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    
    # Transaction that triggered this offer (the 4th transaction)
    trigger_transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # Optional expiry date

