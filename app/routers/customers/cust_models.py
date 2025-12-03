from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    phone = Column(String, nullable=False)
    name = Column(String)
    email = Column(String)
    points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
