from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base


class PointsLedger(Base):
    __tablename__ = "points_ledger"

    points_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)  # For future member support
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)  # For phone-only profiles
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=True)  # Can reference offers or earning_rules
    points_earned = Column(Integer, nullable=False)  # Can be negative for redemptions
    reward_type_applied = Column(String(30), nullable=False)  # POINTS / DISCOUNT / FREE_MONTH
    created_at = Column(DateTime, default=datetime.utcnow)


class PointBalance(Base):
    __tablename__ = "point_balances"

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), primary_key=True)
    total_points = Column(Integer, default=0, nullable=False)
    last_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

