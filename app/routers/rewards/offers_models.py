from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base

class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    title = Column(String)  # Reward Name
    category = Column(String)  # Category
    price = Column(Numeric(10, 2), default=0)  # Price in dollars
    points_required = Column(Integer)  # Cost in Points
    status = Column(String, default="Active")  # Active/Inactive
    start_date = Column(DateTime)
    expiry_date = Column(DateTime)  # End Date
    description = Column(String)  # Optional description field
    created_at = Column(DateTime, default=datetime.utcnow)
