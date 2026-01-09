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
    
    # Debug: Print original columns
    print(f"Original columns: {list(df.columns)}")
    
    # Normalize column names (strip whitespace, convert to lowercase)
    df.columns = df.columns.str.strip().str.lower()
    print(f"Normalized columns: {list(df.columns)}")
    print(f"Sample row data: {df.iloc[0].to_dict() if len(df) > 0 else 'No data'}")
    
    # Map common Excel column names to our expected column names
    column_mapping = {
        # Date columns
        'created': 'date',
        'paid': 'date',
        'modified': 'date',
        'sale date': 'date',
        'transaction date': 'date',
        'date': 'date',
        # Customer code (separate from phone number)
        'customer': 'customer_code',
        'customer code': 'customer_code',
        'customer id': 'customer_code',
        # Phone number columns - "Customer Phone" is the key one!
        'customer phone': 'phone_number',  # This is the main phone number column
        'phone': 'phone_number',
        'phone number': 'phone_number',
        'phone_number': 'phone_number',
        'phone no': 'phone_number',
        'mobile': 'phone_number',
        'mobile number': 'phone_number',
        'tel': 'phone_number',
        'telephone': 'phone_number',
        # License plate columns
        'license': 'license_plate',
        'license plate': 'license_plate',
        'license_plate': 'license_plate',
        'plate': 'license_plate',
        'vehicle': 'license_plate',
        # Description columns
        'pass plan': 'description',
        'description': 'description',
        'notes': 'description',
        'comments': 'description',
        # Amount columns
        'total': 'amount',
        'total $': 'amount',
        'amount': 'amount',
        'price': 'amount',
        'sales dollar': 'amount',
        'upsell dol': 'amount',
    }
    
    # Apply column mapping
    for old_name, new_name in column_mapping.items():
        if old_name in df.columns and new_name not in df.columns:
            df[new_name] = df[old_name]
    
    # Try to auto-detect date column if 'date' is missing
    if 'date' not in df.columns:
        date_candidates = ['created', 'paid', 'modified', 'sale date', 'transaction date']
        for candidate in date_candidates:
            if candidate in df.columns:
                df['date'] = df[candidate]
                break
    
    # Use current date as fallback if no date column found
    if 'date' not in df.columns:
        df['date'] = datetime.now()
    
    # Convert to preview format
    previews = []
    for idx, row in df.iterrows():
        try:
            # Parse date - try multiple formats
            date_value = row.get('date', datetime.now())
            if pd.isna(date_value):
                date_value = datetime.now()
            elif isinstance(date_value, str):
                try:
                    date_obj = pd.to_datetime(date_value, errors='coerce')
                    if pd.isna(date_obj):
                        date_obj = datetime.now()
                except:
                    date_obj = datetime.now()
            else:
                date_obj = pd.to_datetime(date_value, errors='coerce')
                if pd.isna(date_obj):
                    date_obj = datetime.now()
            
            # Get customer code (from Customer column) - this is separate from phone number
            # IMPORTANT: "Customer" column contains the customer code, NOT phone number
            customer_code = None
            # Check mapped customer_code column first
            if 'customer_code' in df.columns and pd.notna(row.get('customer_code')):
                code_val = str(row['customer_code']).strip()
                if code_val and code_val != 'nan' and code_val:
                    customer_code = code_val
            else:
                # Fallback: check original customer column (before mapping)
                customer_code_candidates = ['customer', 'customer code', 'customer id']
                for code_col in customer_code_candidates:
                    if code_col in df.columns and pd.notna(row.get(code_col)):
                        code_val = str(row[code_col]).strip()
                        if code_val and code_val != 'nan' and code_val:
                            customer_code = code_val
                            break
            
            # Get phone number - try multiple columns (NOT customer code)
            # IMPORTANT: "Customer Phone" is the main phone number column!
            phone_number = None
            # Check mapped phone_number column first
            if 'phone_number' in df.columns and pd.notna(row.get('phone_number')):
                phone_val = str(row['phone_number']).strip()
                if phone_val and phone_val != 'nan' and phone_val:
                    phone_number = phone_val
            else:
                # Fallback: check original phone columns (before mapping)
                # Prioritize "customer phone" as it's the actual phone number column
                phone_candidates = ['customer phone', 'phone', 'phone number', 'phone no', 'mobile', 'mobile number', 'tel', 'telephone']
                for phone_col in phone_candidates:
                    if phone_col in df.columns and pd.notna(row.get(phone_col)):
                        phone_val = str(row[phone_col]).strip()
                        if phone_val and phone_val != 'nan' and phone_val:
                            phone_number = phone_val
                            break
            
            # If no phone number found, check all columns for phone-like patterns
            # (but exclude customer code columns)
            if not phone_number:
                for col in df.columns:
                    col_lower = col.lower()
                    # Skip customer code columns
                    if any(cc in col_lower for cc in ['customer', 'code', 'id']):
                        continue
                    # Look for phone-related keywords
                    if any(phone_keyword in col_lower for phone_keyword in ['phone', 'mobile', 'tel', 'contact']):
                        if pd.notna(row.get(col)):
                            phone_val = str(row[col]).strip()
                            if phone_val and phone_val != 'nan' and phone_val:
                                phone_number = phone_val
                                break
            
            # If still no phone number, check if there's a pattern in other columns
            # that looks like a phone number (10+ digits, etc.)
            if not phone_number:
                for col in df.columns:
                    if col in customer_code_candidates:
                        continue
                    if pd.notna(row.get(col)):
                        val = str(row[col]).strip()
                        # Check if it looks like a phone number (contains digits and is reasonably long)
                        if val and val != 'nan':
                            # If it has 10+ digits, might be a phone number
                            digit_count = sum(c.isdigit() for c in val)
                            if digit_count >= 10 and len(val) >= 10:
                                phone_number = val
                                break
            
            # If no phone number found, leave it blank - DO NOT use customer_code
            # Customer code and phone number are SEPARATE fields
            if not phone_number:
                phone_number = ""  # Leave blank - don't use customer_code as fallback
                print(f"Warning: No phone number found for row {idx}")
                print(f"  Customer code: {customer_code}")
                print(f"  Available columns: {list(df.columns)}")
                print(f"  Row sample: {dict(list(row.items())[:5])}")  # First 5 columns for debugging
            
            # Get license plate - allow blank
            license_plate = str(row.get('license_plate', '')).strip()
            if not license_plate or license_plate == 'nan':
                license_plate = ''  # Allow blank
            
            # Get description - use Pass Plan or other description columns
            description = None
            desc_candidates = ['description', 'pass plan', 'notes', 'comments']
            for desc_col in desc_candidates:
                if desc_col in df.columns and pd.notna(row.get(desc_col)):
                    desc_val = str(row[desc_col]).strip()
                    if desc_val and desc_val != 'nan':
                        description = desc_val
                        break
            
            # Get amount - try multiple columns
            amount = 0
            for amt_col in ['amount', 'total', 'total $', 'sales dollar', 'upsell dol']:
                if amt_col in df.columns and pd.notna(row.get(amt_col)):
                    try:
                        amt_val = row[amt_col]
                        # Remove $ and commas if present
                        if isinstance(amt_val, str):
                            amt_val = amt_val.replace('$', '').replace(',', '').strip()
                        amount = float(amt_val) if amt_val else 0
                        break
                    except:
                        continue
            
            preview = TransactionPreview(
                phone_number=phone_number,
                customer_code=customer_code,
                license_plate=license_plate,
                date=date_obj.to_pydatetime() if hasattr(date_obj, 'to_pydatetime') else date_obj,
                description=description,
                quantity=int(row.get('quantity', 1)) if pd.notna(row.get('quantity')) else 1,
                amount=amount,
                discount_amount=float(row.get('discount_amount', 0)) if pd.notna(row.get('discount_amount')) else 0,
                membership_id=str(row.get('membership_id', '')).strip() if pd.notna(row.get('membership_id')) else None
            )
            previews.append(preview)
        except Exception as e:
            # Skip problematic rows instead of failing completely
            import traceback
            print(f"Error parsing row {idx}: {str(e)}")
            print(traceback.format_exc())
            continue
    
    if not previews:
        raise HTTPException(status_code=400, detail="No valid transactions found in file. Please check the file format.")
    
    return previews

@router.post("/approve", response_model=List[TransactionResponse])
def approve_transactions(
    transactions: List[TransactionCreate],
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Approve and save transactions"""
    from uuid import UUID
    business_id = current["business"].id
    
    approved_transactions = []
    
    # Preload reward rules for this business
    from app.routers.rewards.offers_models import Offer
    reward_rules = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True
    ).all()

    for trans_data in transactions:
        # Get or create customer first (needed for sequence calculation)
        customer = (
            db.query(Customer)
            .filter(Customer.business_id == business_id, Customer.phone == trans_data.phone_number)
            .first()
        )
        if not customer:
            # Create customer with membership_id if provided in transaction
            customer = Customer(
                business_id=business_id,
                phone=trans_data.phone_number,
                membership_id=trans_data.membership_id if trans_data.membership_id else None,
            )
            db.add(customer)
            db.flush()
        elif trans_data.membership_id and not customer.membership_id:
            # Update existing customer with membership_id if not already set
            customer.membership_id = trans_data.membership_id

        # Calculate transaction sequence (count of approved transactions before this one + 1)
        from sqlalchemy import func
        from app.routers.rewards.redeemable_offer_service import get_customer_transaction_count_by_phone
        transaction_count = get_customer_transaction_count_by_phone(
            db, trans_data.phone_number, business_id
        )
        transaction_sequence = transaction_count + 1

        # Check if this is 5th transaction and if discount/0 amount indicates redemption
        is_member = customer.membership_id is not None and customer.membership_id != ''
        is_redemption = False
        
        if transaction_sequence == 5:
            # Check if discount_amount > 0 (member) or amount == 0 (non-member) indicates redemption
            if is_member and trans_data.discount_amount > 0:
                is_redemption = True
            elif not is_member and trans_data.amount == 0:
                is_redemption = True
        
        # Create transaction
        transaction = Transaction(
            business_id=business_id,
            phone_number=trans_data.phone_number,
            customer_code=trans_data.customer_code,
            license_plate=trans_data.license_plate,
            date=trans_data.date,
            description=trans_data.description,
            quantity=trans_data.quantity,
            amount=trans_data.amount,
            discount_amount=trans_data.discount_amount,
            transaction_sequence=transaction_sequence,
            is_approved=True,
            approved_at=datetime.utcnow()
        )
        db.add(transaction)
        db.flush()  # Flush to get transaction.id
        approved_transactions.append(transaction)

        # If this is 5th transaction and redemption is indicated, mark offer as redeemed
        if is_redemption and transaction_sequence == 5:
            from app.routers.rewards.redeemable_offer_service import get_customer_redeemable_offers, mark_offer_as_redeemed
            redeemable_offers = get_customer_redeemable_offers(db, customer.id, business_id, include_redeemed=False)
            if redeemable_offers:
                # Mark the most recent unredeemed offer as redeemed
                offer_to_redeem = redeemable_offers[0]
                try:
                    mark_offer_as_redeemed(db, offer_to_redeem.id, transaction.id)
                    
                    # Send redemption confirmation email
                    if customer.email:
                        try:
                            from app.routers.notifications.email_service import email_service
                            email_service.send_redemption_confirmation_email(
                                customer_name=customer.name or "Customer",
                                customer_email=customer.email,
                                offer_name=f"{offer_to_redeem.customer_type} - {offer_to_redeem.reward_type}",
                                reward_type=offer_to_redeem.reward_type,
                                reward_value=offer_to_redeem.reward_value,
                                redemption_code=None  # No code for automatic redemption
                            )
                        except Exception as email_error:
                            # Log error but don't fail transaction
                            import logging
                            logging.error(f"Error sending redemption email: {str(email_error)}")
                except Exception as e:
                    # Log error but don't fail transaction
                    import logging
                    logging.error(f"Error marking offer as redeemed: {e}")

        # Check if this is 4th transaction and create redeemable offer
        if transaction_sequence == 4:
            from app.routers.rewards.redeemable_offer_service import check_and_create_redeemable_offer
            try:
                check_and_create_redeemable_offer(db, customer, transaction, business_id)
            except Exception as e:
                # Log error but don't fail transaction
                print(f"Error creating redeemable offer: {e}")

        # Apply reward rules using the rule engine
        from app.routers.rewards.rule_engine import apply_reward_rules
        reward_result = apply_reward_rules(transaction, reward_rules, customer)
        
        # Apply points if any earned
        if reward_result.points_earned > 0:
            from app.routers.rewards.points_ledger_service import add_points_to_ledger
            from uuid import UUID as UUIDType
            
            # Use the first rule ID if available
            rule_id = None
            if reward_result.applied_rule_ids:
                try:
                    rule_id = UUIDType(reward_result.applied_rule_ids[0])
                except:
                    pass
            
            add_points_to_ledger(
                db=db,
                customer_id=customer.id,
                points_earned=reward_result.points_earned,
                reward_type_applied="POINTS",
                transaction_id=transaction.id,
                rule_id=rule_id
            )
            
            # Also keep old PointsHistory for backward compatibility
            history = PointsHistory(
                customer_id=customer.id,
                business_id=business_id,
                points=reward_result.points_earned,
                reason="transaction"
            )
            db.add(history)
    
    db.commit()
    
    for trans in approved_transactions:
        db.refresh(trans)
    
    return approved_transactions

@router.get("/")
def get_transactions(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db),
    phone_number: str = None,
    license_plate: str = None,
    start_date: str = None,
    end_date: str = None
):
    """Get all transactions for the current business with customer information"""
    from uuid import UUID
    from datetime import datetime as dt
    business_id = current["business"].id
    
    query = db.query(Transaction).filter(Transaction.business_id == business_id, Transaction.is_approved == True)
    
    if phone_number:
        query = query.filter(Transaction.phone_number == phone_number)
    if license_plate:
        query = query.filter(Transaction.license_plate == license_plate)
    if start_date:
        try:
            start_dt = dt.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Transaction.date >= start_dt)
        except:
            pass
    if end_date:
        try:
            end_dt = dt.strptime(end_date, '%Y-%m-%d')
            # Add one day to include the end date
            from datetime import timedelta
            end_dt = end_dt + timedelta(days=1)
            query = query.filter(Transaction.date < end_dt)
        except:
            pass
    
    transactions = query.order_by(Transaction.date.desc()).all()
    
    # Enrich with customer information
    result = []
    for trans in transactions:
        customer = db.query(Customer).filter(
            Customer.business_id == business_id,
            Customer.phone == trans.phone_number
        ).first()
        
        trans_dict = {
            "id": str(trans.id),
            "business_id": str(trans.business_id),
            "phone_number": trans.phone_number,
            "customer_code": trans.customer_code,
            "license_plate": trans.license_plate,
            "date": trans.date.isoformat() if trans.date else None,
            "description": trans.description,
            "quantity": trans.quantity,
            "amount": float(trans.amount) if trans.amount else 0,
            "discount_amount": float(trans.discount_amount) if trans.discount_amount else 0,
            "transaction_sequence": trans.transaction_sequence,
            "is_approved": trans.is_approved,
            "created_at": trans.created_at.isoformat() if trans.created_at else None,
            "approved_at": trans.approved_at.isoformat() if trans.approved_at else None,
            "customer_name": customer.name if customer else None,
            "customer_email": customer.email if customer else None,
            "customer_id": str(customer.id) if customer else None,
            "membership_id": customer.membership_id if customer else None,
        }
        result.append(trans_dict)
    
    return result

@router.get("/pending", response_model=List[TransactionResponse])
def get_pending_transactions(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """Get pending (unapproved) transactions"""
    from uuid import UUID
    business_id = current["business"].id
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
    business_id = current["business"].id
    
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

