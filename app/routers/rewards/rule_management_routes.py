from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import List, Optional
from datetime import datetime, date as date_type
from pydantic import BaseModel

from app.database import SessionLocal
from app.dependencies import get_current_business
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.offers_schemas import OfferResponse
from app.routers.transactions.transaction_models import Transaction
from app.routers.customers.cust_models import Customer

router = APIRouter()


@router.get("/test")
def test_endpoint(current: dict = Depends(get_current_business)):
    """Test endpoint to verify authentication and business access"""
    return {
        "status": "ok",
        "business_id": str(current["business"].id),
        "business_name": current["business"].name if hasattr(current["business"], 'name') else "Unknown",
        "user_role": current["user"]["role"]
    }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/rules", response_model=List[OfferResponse])
def list_rules(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Get all reward rules for the business"""
    business_id = current["business"].id
    
    query = db.query(Offer).filter(Offer.business_id == business_id)
    
    if active_only:
        query = query.filter(Offer.is_active == True)
    
    rules = query.order_by(Offer.priority.desc(), Offer.created_at.desc()).all()
    return rules


@router.get("/rules/{rule_id}", response_model=OfferResponse)
def get_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Get a specific reward rule"""
    business_id = current["business"].id
    rule_uuid = UUID(rule_id)
    
    rule = db.query(Offer).filter(
        Offer.id == rule_uuid,
        Offer.business_id == business_id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    return rule


@router.put("/rules/{rule_id}/toggle")
def toggle_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Toggle rule active status"""
    business_id = current["business"].id
    rule_uuid = UUID(rule_id)
    
    rule = db.query(Offer).filter(
        Offer.id == rule_uuid,
        Offer.business_id == business_id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule.is_active = not rule.is_active
    db.commit()
    db.refresh(rule)
    
    return {"id": str(rule.id), "is_active": rule.is_active}


@router.delete("/rules/{rule_id}")
def delete_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Delete a reward rule"""
    business_id = current["business"].id
    rule_uuid = UUID(rule_id)
    
    rule = db.query(Offer).filter(
        Offer.id == rule_uuid,
        Offer.business_id == business_id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    db.delete(rule)
    db.commit()
    
    return {"message": "Rule deleted successfully"}


@router.post("/rules/test")
def test_rule_application(
    transaction_id: str = Query(..., description="Transaction ID to test"),
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Test which rules would apply to a specific transaction"""
    from app.routers.rewards.rule_engine import apply_reward_rules
    
    business_id = current["business"].id
    trans_uuid = UUID(transaction_id)
    
    transaction = db.query(Transaction).filter(
        Transaction.id == trans_uuid,
        Transaction.business_id == business_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get customer
    customer = db.query(Customer).filter(
        Customer.business_id == business_id,
        Customer.phone == transaction.phone_number
    ).first()
    
    # Get all active rules
    rules = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True
    ).all()
    
    # Apply rules
    result = apply_reward_rules(transaction, rules, customer)
    
    return {
        "transaction_id": str(transaction.id),
        "points_earned": result.points_earned,
        "discount_amount": float(result.discount_amount),
        "free_months": result.free_months,
        "applied_rule_ids": result.applied_rule_ids,
        "applied_rules": result.applied_rules
    }


# Fixed Rules Schema
class FixedRuleResponse(BaseModel):
    id: str
    rule_id: Optional[str] = None  # Alias for id for frontend compatibility
    name: str
    description: str
    customer_type: str  # MEMBER or NON_MEMBER
    reward_type: str
    reward_value: str
    reward_options: Optional[List[str]] = None  # For rule 2: ["FREE_WASH", "POINTS"]
    
    class Config:
        from_attributes = True


class CustomerEligibilityResponse(BaseModel):
    customer: dict
    eligible_rules: List[dict]
    visit_count: int  # For non-member rule 2 (4th visit)


class ApplyRuleRequest(BaseModel):
    rule_id: str
    customer_id: str
    reward_option: Optional[str] = None  # For rule 2: "FREE_WASH" or "POINTS"


@router.post("/fixed-rules/initialize")
def initialize_fixed_rules(
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Initialize default fixed rules for the business (Member 20% discount, Non-member 5th wash free)"""
    business_id = current["business"].id
    
    # Check if rules already exist
    existing_member = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.customer_type == 'MEMBER',
        Offer.reward_type == 'DISCOUNT_PERCENT',
        Offer.reward_value == '20'
    ).first()
    
    existing_non_member = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.customer_type == 'NON_MEMBER',
        Offer.reward_type == 'FREE_WASH'
    ).first()
    
    created_rules = []
    
    # Create Member rule if it doesn't exist
    if not existing_member:
        from datetime import date, timedelta
        member_rule = Offer(
            business_id=business_id,
            name="Member 5th Wash - 20% Discount",
            description="Members get 20% discount on their 5th car wash",
            customer_type='MEMBER',
            product_type='WASH',
            reward_type='DISCOUNT_PERCENT',
            reward_value='20',
            per_unit='PER_TRANSACTION',
            priority=10,
            start_date=date.today(),
            end_date=None,  # No expiry
            is_active=True,
            title="Member 5th Wash - 20% Discount",
            status="Active"
        )
        db.add(member_rule)
        created_rules.append("Member rule")
    
    # Create Non-member rule if it doesn't exist
    if not existing_non_member:
        from datetime import date
        non_member_rule = Offer(
            business_id=business_id,
            name="Non-Member 5th Wash Free",
            description="Non-members get their 5th car wash free",
            customer_type='NON_MEMBER',
            product_type='WASH',
            reward_type='FREE_WASH',
            reward_value='FREE',
            per_unit='PER_TRANSACTION',
            priority=10,
            start_date=date.today(),
            end_date=None,  # No expiry
            is_active=True,
            title="Non-Member 5th Wash Free",
            status="Active"
        )
        db.add(non_member_rule)
        created_rules.append("Non-member rule")
    
    db.commit()
    
    # Refresh to get the created rules with IDs
    if 'Member rule' in created_rules:
        db.refresh(member_rule)
    if 'Non-member rule' in created_rules:
        db.refresh(non_member_rule)
    
    # Query the rules we just created to return them
    rules_query = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True,
        Offer.customer_type.in_(['MEMBER', 'NON_MEMBER'])
    )
    
    if created_rules:
        # If we created rules, filter to just get the fixed ones
        rules_list = rules_query.order_by(Offer.priority.desc()).all()
        fixed_rules_list = []
        for rule in rules_list:
            is_member = (rule.customer_type == 'MEMBER' and rule.reward_type == 'DISCOUNT_PERCENT' and '20' in str(rule.reward_value))
            is_non_member = (rule.customer_type == 'NON_MEMBER' and (rule.reward_type == 'FREE_WASH' or '5th' in rule.name.lower()))
            if is_member or is_non_member:
                fixed_rules_list.append({
                    "id": str(rule.id),
                    "name": rule.name,
                    "description": rule.description
                })
    
    if created_rules:
        return {
            "message": f"Fixed rules initialized: {', '.join(created_rules)}",
            "created": created_rules,
            "rules_count": len(fixed_rules_list) if created_rules else 0
        }
    else:
        return {
            "message": "Fixed rules already exist",
            "created": []
        }


@router.get("/fixed-rules", response_model=List[FixedRuleResponse])
def get_fixed_rules(
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Get fixed reward rules for the business"""
    try:
        business_id = current["business"].id
        
        # Get fixed rules - we'll identify them by specific criteria
        # Rule 1: Member 20% discount on 5th wash
        # Rule 2: Non-member 5th wash free
        
        # First, get all MEMBER and NON_MEMBER rules
        all_rules = db.query(Offer).filter(
            Offer.business_id == business_id,
            Offer.is_active == True,
            Offer.customer_type.in_(['MEMBER', 'NON_MEMBER'])
        ).order_by(Offer.priority.desc()).all()
        
        # Filter to only the two fixed rules we care about
        fixed_rules_data = []
        for rule in all_rules:
            try:
                # Check member rule: 20% discount
                is_member_rule = (
                    rule.customer_type == 'MEMBER' and 
                    rule.reward_type == 'DISCOUNT_PERCENT' and
                    (str(rule.reward_value) == '20' or str(rule.reward_value) == '20.0' or '20' in str(rule.reward_value))
                )
                
                # Check non-member rule: 5th wash free (can be FREE_WASH or name contains 5th)
                is_non_member_rule = (
                    rule.customer_type == 'NON_MEMBER' and
                    (
                        rule.reward_type == 'FREE_WASH' or 
                        (rule.name and ('5th' in rule.name.lower() or 'fifth' in rule.name.lower() or ('5' in rule.name.lower() and 'wash' in rule.name.lower())))
                    )
                )
                
                if is_member_rule or is_non_member_rule:
                    rule_data = {
                        "id": str(rule.id),
                        "rule_id": str(rule.id),  # Add rule_id for frontend compatibility
                        "name": rule.name or "Unnamed Rule",
                        "description": rule.description or f"{rule.customer_type} reward",
                        "customer_type": rule.customer_type,
                        "reward_type": rule.reward_type,
                        "reward_value": str(rule.reward_value) if rule.reward_value else "",
                        "reward_options": None
                    }
                    
                    # For non-member rule, add options
                    if is_non_member_rule:
                        rule_data["reward_options"] = ["FREE_WASH", "POINTS"]
                    
                    fixed_rules_data.append(rule_data)
            except Exception as e:
                # Log error for individual rule but continue
                import traceback
                print(f"Error processing rule {rule.id if rule else 'unknown'}: {str(e)}")
                print(traceback.format_exc())
                continue
        
        return fixed_rules_data
    except KeyError as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"KeyError in get_fixed_rules: {str(e)}")
        print(f"Current keys: {list(current.keys()) if current else 'current is None'}")
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"Error accessing business data: {str(e)}. Available keys: {list(current.keys()) if current else 'None'}")
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in get_fixed_rules: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"Error fetching fixed rules: {str(e)}")


@router.get("/customer-eligibility")
def check_customer_eligibility(
    phone: str = Query(..., description="Customer phone number"),
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Check which fixed rules a customer is eligible for"""
    business_id = current["business"].id
    
    # Lookup customer
    customer = db.query(Customer).filter(
        Customer.business_id == business_id,
        Customer.phone == phone
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Determine if member or non-member
    is_member = customer.membership_id is not None and customer.membership_id != ''
    customer_type = 'MEMBER' if is_member else 'NON_MEMBER'
    
    # Get fixed rules
    rules = db.query(Offer).filter(
        Offer.business_id == business_id,
        Offer.is_active == True,
        Offer.customer_type.in_(['MEMBER', 'NON_MEMBER'])
    ).order_by(Offer.priority.desc()).all()
    
    eligible_rules = []
    visit_count = 0
    
    for rule in rules:
        # Check if rule applies to this customer type
        if rule.customer_type != customer_type and rule.customer_type != 'ANY':
            continue
        
        is_member_rule = (
            rule.customer_type == 'MEMBER' and 
            rule.reward_type == 'DISCOUNT_PERCENT' and
            str(rule.reward_value) == '20'
        )
        is_non_member_rule = (
            rule.customer_type == 'NON_MEMBER' and
            (rule.reward_type == 'FREE_WASH' or rule.name.lower().find('5th') != -1 or rule.name.lower().find('fifth') != -1)
        )
        
        if is_member_rule and customer_type == 'MEMBER':
            # Count customer visits (approved transactions)
            visit_count = db.query(func.count(Transaction.id)).filter(
                Transaction.business_id == business_id,
                Transaction.phone_number == customer.phone,
                Transaction.is_approved == True
            ).scalar() or 0
            
            eligible_rules.append({
                "rule_id": str(rule.id),
                "name": rule.name,
                "description": rule.description or "20% discount on 5th wash for members",
                "customer_type": "MEMBER",
                "reward_type": "DISCOUNT_PERCENT",
                "reward_value": "20",
                "eligible": visit_count >= 4,  # Eligible after 4th transaction
                "visit_count": visit_count
            })
        elif is_non_member_rule and customer_type == 'NON_MEMBER':
            # Count customer visits (approved transactions)
            visit_count = db.query(func.count(Transaction.id)).filter(
                Transaction.business_id == business_id,
                Transaction.phone_number == customer.phone,
                Transaction.is_approved == True
            ).scalar() or 0
            
            eligible_rules.append({
                "rule_id": str(rule.id),
                "name": rule.name,
                "description": rule.description or "5th car wash free",
                "customer_type": "NON_MEMBER",
                "reward_type": "FREE_WASH",
                "reward_value": "FREE",
                "eligible": visit_count >= 4,  # Eligible after 4th transaction
                "visit_count": visit_count
            })
    
    return {
        "customer": {
            "id": str(customer.id),
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "membership_id": customer.membership_id,
            "is_member": is_member,
            "customer_type": customer_type
        },
        "eligible_rules": eligible_rules,
        "visit_count": visit_count
    }


@router.post("/apply-rule")
def apply_rule_reward(
    request: ApplyRuleRequest,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    """Apply a fixed rule reward to a customer"""
    business_id = current["business"].id
    rule_uuid = UUID(request.rule_id)
    customer_uuid = UUID(request.customer_id)
    
    # Verify rule exists and is active
    rule = db.query(Offer).filter(
        Offer.id == rule_uuid,
        Offer.business_id == business_id,
        Offer.is_active == True
    ).first()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    # Verify customer exists
    customer = db.query(Customer).filter(
        Customer.id == customer_uuid,
        Customer.business_id == business_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check eligibility
    is_member = customer.membership_id is not None and customer.membership_id != ''
    if rule.customer_type == 'MEMBER' and not is_member:
        raise HTTPException(status_code=400, detail="Customer is not eligible for member rule")
    if rule.customer_type == 'NON_MEMBER' and is_member:
        raise HTTPException(status_code=400, detail="Customer is not eligible for non-member rule")
    
    # Apply reward based on rule type
    if rule.reward_type == 'DISCOUNT_PERCENT':
        # For discount, we just record it (discount will apply at transaction time)
        return {
            "message": "Discount rule will be applied at transaction time",
            "rule_id": str(rule.id),
            "discount_percent": rule.reward_value
        }
    
    elif rule.reward_type == 'FREE_WASH' or (rule.customer_type == 'NON_MEMBER' and rule.reward_type != 'POINTS'):
        # For non-member rule (5th wash), check if it's actually the 5th visit
        visit_count = db.query(func.count(Transaction.id)).filter(
            Transaction.business_id == business_id,
            Transaction.phone_number == customer.phone,
            Transaction.is_approved == True
        ).scalar() or 0
        
        # Check if this is for 5th wash rule
        is_5th_wash_rule = (
            rule.customer_type == 'NON_MEMBER' and
            (rule.name.lower().find('5th') != -1 or rule.name.lower().find('fifth') != -1 or rule.reward_type == 'FREE_WASH')
        )
        
        if is_5th_wash_rule and visit_count < 5:
            raise HTTPException(
                status_code=400, 
                detail=f"Customer has only {visit_count} visit(s). Need 5 visits for this reward."
            )
        
        # For non-member rule 2, check reward option
        if request.reward_option == 'POINTS':
            # Add 20 points
            from app.routers.rewards.points_ledger_service import add_points_to_ledger
            points = 20  # Fixed value for rule 2
            add_points_to_ledger(
                db=db,
                customer_id=customer.id,
                points_earned=points,
                reward_type_applied="POINTS",
                rule_id=rule.id
            )
            db.commit()
            
            return {
                "message": f"{points} points added to customer account",
                "rule_id": str(rule.id),
                "reward_type": "POINTS",
                "points_added": points
            }
        elif request.reward_option == 'FREE_WASH':
            # For free wash, we can create a voucher/note or just return success
            # For now, we'll just return success message
            # In production, you might want to create a voucher record
            return {
                "message": "Free wash reward applied - customer eligible for free wash",
                "rule_id": str(rule.id),
                "reward_type": "FREE_WASH"
            }
        else:
            raise HTTPException(status_code=400, detail="Please select reward option: FREE_WASH or POINTS")
    
    raise HTTPException(status_code=400, detail="Unable to apply rule")

