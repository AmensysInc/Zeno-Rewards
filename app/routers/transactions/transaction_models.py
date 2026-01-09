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
    customer_code = Column(String, nullable=True)  # Customer code from Excel (e.g., "A-CNPFG8")
    license_plate = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    description = Column(String)
    quantity = Column(Integer, default=1)
    amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)  # Discount applied (from Excel or redemption)
    is_approved = Column(Boolean, default=False)
    transaction_sequence = Column(Integer, nullable=True)  # Which wash number this is (1st, 2nd, 3rd, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

