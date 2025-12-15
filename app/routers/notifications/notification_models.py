from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    channel = Column(String, nullable=False)  # email | sms
    type = Column(String, nullable=False)  # welcome | earn | redeem | campaign
    payload = Column(String)  # JSON string with content
    status = Column(String, default="pending")  # pending | sent | failed
    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)


