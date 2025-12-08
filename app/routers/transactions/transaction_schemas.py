from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class TransactionCreate(BaseModel):
    phone_number: str
    license_plate: str
    date: datetime
    description: str | None = None
    quantity: int = 1
    amount: Decimal = 0

class TransactionResponse(BaseModel):
    id: UUID
    business_id: UUID
    phone_number: str
    license_plate: str
    date: datetime
    description: str | None
    quantity: int
    amount: Decimal
    is_approved: bool
    created_at: datetime
    approved_at: datetime | None

    class Config:
        from_attributes = True

class TransactionPreview(BaseModel):
    phone_number: str
    license_plate: str
    date: datetime
    description: str | None
    quantity: int
    amount: Decimal

