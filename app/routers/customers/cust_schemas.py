from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime



class CustomerCreate(BaseModel):
    phone: str
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None  


class CustomerResponse(BaseModel):
    id: UUID
    business_id: UUID
    phone: str
    name: str | None
    email: str | None
    points: int
    created_at: datetime

    class Config:
        orm_mode = True
