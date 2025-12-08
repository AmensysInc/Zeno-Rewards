from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)
    phone_number = Column(String, nullable=False)
    license_plate = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    description = Column(String)
    quantity = Column(Integer, default=1)
    amount = Column(Numeric(10, 2), default=0)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

