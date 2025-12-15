from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from io import BytesIO
from datetime import datetime
from app.database import SessionLocal
from app.routers.transactions.transaction_models import Transaction
from app.routers.customers.cust_models import Customer
from app.routers.rewards.points_models import PointsHistory, EarningRule
from app.routers.transactions.transaction_schemas import TransactionCreate, TransactionResponse, TransactionPreview
from app.dependencies import get_current_business, get_db

router = APIRouter()

@router.post("/upload/preview", response_model=List[TransactionPreview])
async def upload_transactions_preview(
    file: UploadFile = File(...),
    current: dict = Depends(get_current_business)
):
    """Upload and preview transactions before approval"""
    # business_id is available but not needed for preview
    
    # Read file
    contents = await file.read()
    
    # Try to parse as Excel or CSV
    try:
        if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(BytesIO(contents))
        elif file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload Excel or CSV.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Validate required columns
    required_columns = ['phone_number', 'license_plate', 'date']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )
    
    # Convert to preview format
    previews = []
    for _, row in df.iterrows():
        try:
            # Parse date
            date_value = row['date']
            if isinstance(date_value, str):
                date_obj = pd.to_datetime(date_value)
            else:
                date_obj = date_value
            
            preview = TransactionPreview(
                phone_number=str(row['phone_number']),
                license_plate=str(row['license_plate']),
                date=date_obj.to_pydatetime() if hasattr(date_obj, 'to_pydatetime') else date_obj,
                description=str(row.get('description', '')) if pd.notna(row.get('description')) else None,
                quantity=int(row.get('quantity', 1)) if pd.notna(row.get('quantity')) else 1,
                amount=float(row.get('amount', 0)) if pd.notna(row.get('amount')) else 0
            )
            previews.append(preview)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing row: {str(e)}")
    
    return previews

@router.post("/approve", response_model=List[TransactionResponse])
def approve_transactions(
    transactions: List[TransactionCreate],
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Approve and save transactions"""
    from uuid import UUID
    business_id = UUID(current["user"]["business_id"])
    
    approved_transactions = []
    # Preload earning rules for this business
    rules = (
        db.query(EarningRule)
        .filter(EarningRule.business_id == business_id, EarningRule.active == True)
        .all()
    )

    def calculate_points(amount, quantity):
        """Very simple rules engine: per_dollar and per_service."""
        total = 0
        for r in rules:
            if r.rule_type == "per_dollar":
                try:
                    total += int(amount) * r.points_awarded
                except Exception:
                    continue
            elif r.rule_type == "per_service":
                total += int(quantity) * r.points_awarded
        # fallback if no rules configured
        if not rules:
            total += int(quantity)
        return max(total, 0)

    for trans_data in transactions:
        transaction = Transaction(
            business_id=business_id,
            phone_number=trans_data.phone_number,
            license_plate=trans_data.license_plate,
            date=trans_data.date,
            description=trans_data.description,
            quantity=trans_data.quantity,
            amount=trans_data.amount,
            is_approved=True,
            approved_at=datetime.utcnow()
        )
        db.add(transaction)
        approved_transactions.append(transaction)

        # Points earning via rules (or basic fallback)
        customer = (
            db.query(Customer)
            .filter(Customer.business_id == business_id, Customer.phone == trans_data.phone_number)
            .first()
        )
        if not customer:
            customer = Customer(
                business_id=business_id,
                phone=trans_data.phone_number,
            )
            db.add(customer)
            db.flush()

        earn_points = calculate_points(trans_data.amount, trans_data.quantity)
        if earn_points > 0:
            customer.points = (customer.points or 0) + earn_points
            history = PointsHistory(
                customer_id=customer.id,
                business_id=business_id,
                points=earn_points,
                reason="transaction"
            )
            db.add(history)
    
    db.commit()
    
    for trans in approved_transactions:
        db.refresh(trans)
    
    return approved_transactions

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db),
    phone_number: str = None,
    license_plate: str = None
):
    """Get all transactions for the current business"""
    from uuid import UUID
    business_id = UUID(current["user"]["business_id"])
    
    query = db.query(Transaction).filter(Transaction.business_id == business_id)
    
    if phone_number:
        query = query.filter(Transaction.phone_number == phone_number)
    if license_plate:
        query = query.filter(Transaction.license_plate == license_plate)
    
    transactions = query.order_by(Transaction.date.desc()).all()
    return transactions

@router.get("/pending", response_model=List[TransactionResponse])
def get_pending_transactions(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Get pending (unapproved) transactions"""
    from uuid import UUID
    business_id = UUID(current["user"]["business_id"])
    transactions = db.query(Transaction).filter(
        Transaction.business_id == business_id,
        Transaction.is_approved == False
    ).order_by(Transaction.created_at.desc()).all()
    return transactions

@router.get("/summary")
def get_transaction_summary(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Get transaction summary grouped by phone number and license plate"""
    from uuid import UUID
    business_id = UUID(current["user"]["business_id"])
    
    transactions = db.query(Transaction).filter(
        Transaction.business_id == business_id,
        Transaction.is_approved == True
    ).all()
    
    # Group by phone_number and license_plate
    summary = {}
    for trans in transactions:
        key = f"{trans.phone_number}_{trans.license_plate}"
        if key not in summary:
            summary[key] = {
                "phone_number": trans.phone_number,
                "license_plate": trans.license_plate,
                "total_transactions": 0,
                "total_quantity": 0,
                "total_amount": 0,
                "transactions": []
            }
        
        summary[key]["total_transactions"] += 1
        summary[key]["total_quantity"] += trans.quantity
        summary[key]["total_amount"] += float(trans.amount)
        summary[key]["transactions"].append({
            "id": str(trans.id),
            "date": trans.date,
            "description": trans.description,
            "quantity": trans.quantity,
            "amount": float(trans.amount)
        })
    
    return list(summary.values())

