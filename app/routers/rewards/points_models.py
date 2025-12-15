from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base

class PointsHistory(Base):
    __tablename__ = "points_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"))
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    points = Column(Integer)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class EarningRule(Base):
    __tablename__ = "earning_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    rule_name = Column(String, nullable=False)
    rule_type = Column(String, nullable=False)  # per_dollar | per_service | bonus | multiplier
    points_awarded = Column(Integer, nullable=False)
    conditions = Column(String)  # JSON string for now
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
