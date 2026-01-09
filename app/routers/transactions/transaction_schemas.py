from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class TransactionCreate(BaseModel):
    phone_number: str
    customer_code: str | None = None  # Customer code from Excel
    license_plate: str
    date: datetime
    description: str | None = None
    quantity: int = 1
    amount: Decimal = 0
    discount_amount: Decimal = 0  # Discount from Excel (for members) or 0 for free (non-members)
    membership_id: str | None = None  # Membership ID from Excel

class TransactionResponse(BaseModel):
    id: UUID
    business_id: UUID
    phone_number: str
    customer_code: str | None
    license_plate: str
    date: datetime
    description: str | None
    quantity: int
    amount: Decimal
    discount_amount: Decimal
    is_approved: bool
    transaction_sequence: int | None
    created_at: datetime
    approved_at: datetime | None

    class Config:
        from_attributes = True

class TransactionPreview(BaseModel):
    phone_number: str
    customer_code: str | None = None  # Customer code from Excel
    license_plate: str
    date: datetime
    description: str | None
    quantity: int
    amount: Decimal
    discount_amount: Decimal = 0  # Discount from Excel
    membership_id: str | None = None  # Membership ID from Excel

