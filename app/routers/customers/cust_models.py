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
    password_hash = Column(String, nullable=True)  # For customer login (set via email link)
    membership_id = Column(String, nullable=True)  # Membership ID/Code (customer code)
    plan = Column(String, nullable=True)  # Plan: Silver, Gold, Platinum, Diamond, or N/A
    date_of_birth = Column(DateTime, nullable=True)  # Date of birth
    points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
