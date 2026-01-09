from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Date, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base

class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)
    
    # Basic Info
    name = Column(String(150), nullable=False)  # Short name (e.g., "Gold Wash - Non Member")
    description = Column(Text)  # Human readable text
    
    # CONDITIONS (Filters)
    customer_type = Column(String(20), default='ANY')  # MEMBER, NON_MEMBER, ANY
    product_type = Column(String(30), default='ANY')  # WASH, MEMBERSHIP, DETAIL, ANY
    wash_type = Column(String(30), nullable=True)  # GOLD, SILVER, BRONZE, etc.
    membership_term = Column(String(30), nullable=True)  # ONE_YEAR, MONTHLY, SIX_MONTH
    
    # REWARD ACTION
    reward_type = Column(String(30), nullable=False)  # POINTS, DISCOUNT_PERCENT, FREE_MONTHS
    reward_value = Column(String(50), nullable=False)  # numeric or text (e.g. "20", "20%", "1")
    per_unit = Column(String(30), default='PER_TRANSACTION')  # PER_TRANSACTION, PER_DOLLAR, PER_VISIT
    
    # RULE MANAGEMENT
    priority = Column(Integer, default=1)  # Higher runs first
    max_uses_per_customer = Column(Integer, nullable=True)  # Limit usage
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # Null = no expiry
    is_active = Column(Boolean, default=True)  # Enable/Disable rule
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Legacy fields for backward compatibility (can be removed later)
    title = Column(String)  # Alias for name
    category = Column(String)  # Alias for wash_type
    price = Column(String)  # Not used in new structure
    points_required = Column(Integer)  # Derived from reward_value when reward_type is POINTS
    status = Column(String)  # Alias for is_active
    expiry_date = Column(DateTime)  # Alias for end_date
