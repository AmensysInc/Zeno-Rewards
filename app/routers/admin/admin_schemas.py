from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AdminCreate(BaseModel):
    email: str
    password: str

class AdminResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

