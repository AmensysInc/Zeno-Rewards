from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class EarningRuleCreate(BaseModel):
    rule_name: str
    rule_type: str  # per_dollar | per_service | bonus | multiplier
    points_awarded: int
    conditions: str | None = None  # JSON string


class EarningRuleResponse(BaseModel):
    id: UUID
    business_id: UUID
    rule_name: str
    rule_type: str
    points_awarded: int
    conditions: str | None
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True


