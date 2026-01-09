from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, date


class CustomerCreate(BaseModel):
    phone: str
    name: str | None = None
    email: EmailStr | None = None
    membership_id: str | None = None  # Membership ID/Code (customer code)
    plan: str | None = None  # Plan: Silver, Gold, Platinum, Diamond, or N/A
    date_of_birth: date | None = None  # Date of birth


class CustomerResponse(BaseModel):
    id: UUID
    business_id: UUID
    phone: str
    name: str | None
    email: str | None
    membership_id: str | None
    plan: str | None
    date_of_birth: date | None
    points: int
    created_at: datetime

    class Config:
        orm_mode = True
