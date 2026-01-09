from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class PointsLedgerCreate(BaseModel):
    member_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    transaction_id: Optional[UUID] = None
    rule_id: Optional[UUID] = None
    points_earned: int
    reward_type_applied: str  # POINTS / DISCOUNT / FREE_MONTH


class PointsLedgerResponse(BaseModel):
    points_id: UUID
    member_id: Optional[UUID]
    customer_id: Optional[UUID]
    transaction_id: Optional[UUID]
    rule_id: Optional[UUID]
    points_earned: int
    reward_type_applied: str
    created_at: datetime

    class Config:
        from_attributes = True


class PointBalanceResponse(BaseModel):
    customer_id: UUID
    total_points: int
    last_updated_at: datetime

    class Config:
        from_attributes = True

