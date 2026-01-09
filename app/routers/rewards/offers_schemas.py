from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date
from typing import Optional


class OfferCreate(BaseModel):
    name: str  # Rule Name
    description: Optional[str] = None
    
    # CONDITIONS
    customer_type: str = "ANY"  # MEMBER, NON_MEMBER, ANY
    product_type: str = "ANY"  # WASH, MEMBERSHIP, DETAIL, ANY
    wash_type: Optional[str] = None  # GOLD, SILVER, BRONZE, etc.
    membership_term: Optional[str] = None  # ONE_YEAR, MONTHLY, SIX_MONTH
    
    # REWARD ACTION
    reward_type: str  # POINTS, DISCOUNT_PERCENT, FREE_MONTHS
    reward_value: str  # numeric or text (e.g. "20", "20%", "1")
    per_unit: str = "PER_TRANSACTION"  # PER_TRANSACTION, PER_DOLLAR, PER_VISIT
    
    # RULE MANAGEMENT
    priority: int = 1
    max_uses_per_customer: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True


class OfferResponse(BaseModel):
    id: UUID
    business_id: UUID
    name: str
    description: Optional[str]
    customer_type: str
    product_type: str
    wash_type: Optional[str]
    membership_term: Optional[str]
    reward_type: str
    reward_value: str
    per_unit: str
    priority: int
    max_uses_per_customer: Optional[int]
    start_date: date
    end_date: Optional[date]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

