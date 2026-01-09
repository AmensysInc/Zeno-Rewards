from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class StaffCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "staff"  # staff | manager


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None  # Optional for updates
    role: Optional[str] = None


class StaffResponse(BaseModel):
    id: UUID
    business_id: UUID
    name: str
    email: str
    role: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

