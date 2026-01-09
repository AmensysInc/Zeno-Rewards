from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class RedeemableOfferResponse(BaseModel):
    id: UUID
    customer_id: UUID
    business_id: UUID
    rule_id: Optional[UUID]
    customer_type: str
    reward_type: str
    reward_value: str
    is_redeemed: bool
    redeemed_at: Optional[datetime]
    redeemed_transaction_id: Optional[UUID]
    trigger_transaction_id: Optional[UUID]
    created_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


class RedeemOfferRequest(BaseModel):
    redeemable_offer_id: UUID

