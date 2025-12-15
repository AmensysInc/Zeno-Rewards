from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # referral | birthday | frequency | seasonal
    bonus_points = Column(Integer, nullable=False)
    conditions = Column(String)  # JSON string with thresholds etc.
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


