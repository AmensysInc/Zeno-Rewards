from typing import List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from app.routers.rewards.offers_models import Offer
from app.routers.transactions.transaction_models import Transaction
from app.routers.customers.cust_models import Customer


class RewardResult:
    """Result of applying reward rules to a transaction"""
    def __init__(self):
        self.points_earned = 0
        self.discount_amount = Decimal('0.00')
        self.free_months = 0
        self.applied_rule_ids = []
        self.applied_rules = []  # Store rule details


def rule_applies_to_transaction(rule: Offer, transaction: Transaction, customer: Customer = None) -> bool:
    """Check if a reward rule applies to a given transaction"""
    from datetime import date as date_type
    
    # Check if rule is active
    if not rule.is_active:
        return False
    
    # Check date range
    today = date_type.today()
    if rule.start_date and today < rule.start_date:
        return False
    if rule.end_date and today > rule.end_date:
        return False
    
    # Check customer type
    if rule.customer_type != 'ANY':
        if customer:
            is_member = customer.membership_id is not None and customer.membership_id != ''
            if rule.customer_type == 'MEMBER' and not is_member:
                return False
            if rule.customer_type == 'NON_MEMBER' and is_member:
                return False
        else:
            # If no customer and rule requires specific type, skip
            if rule.customer_type in ['MEMBER', 'NON_MEMBER']:
                return False
    
    # Check product type (if specified)
    if rule.product_type != 'ANY':
        # For now, we'll check description or other fields
        # This can be extended based on transaction data
        pass
    
    # Check wash type (if specified)
    if rule.wash_type:
        # Check if transaction description matches wash type
        if transaction.description:
            desc_lower = transaction.description.lower()
            wash_lower = rule.wash_type.lower()
            if wash_lower not in desc_lower:
                return False
    
    return True


def apply_reward_rules(transaction: Transaction, rules: List[Offer], customer: Customer = None) -> RewardResult:
    """
    Apply reward rules to a transaction and return the result.
    Rules are processed in priority order (higher priority first).
    """
    result = RewardResult()
    
    # Sort rules by priority (higher priority first)
    sorted_rules = sorted(rules, key=lambda r: r.priority, reverse=True)
    
    for rule in sorted_rules:
        # Check if rule applies to this transaction
        if not rule_applies_to_transaction(rule, transaction, customer):
            continue
        
        # Check max uses per customer if specified
        if rule.max_uses_per_customer and customer:
            # TODO: Implement usage tracking per customer per rule
            # For now, we'll skip this check
            pass
        
        try:
            reward_value = float(rule.reward_value)
        except (ValueError, TypeError):
            continue
        
        # Apply rule based on reward type
        if rule.reward_type == "POINTS":
            if rule.per_unit == "PER_TRANSACTION":
                points = int(reward_value)
            elif rule.per_unit == "PER_DOLLAR":
                points = int(float(transaction.amount) * reward_value)
            elif rule.per_unit == "PER_VISIT":
                points = int(reward_value)  # Same as per transaction for now
            else:
                points = 0
            
            points = round(points)  # Round to whole points
            if points > 0:
                result.points_earned += points
                result.applied_rule_ids.append(str(rule.id))
                result.applied_rules.append({
                    "rule_id": str(rule.id),
                    "rule_name": rule.name,
                    "reward_type": "POINTS",
                    "points": points
                })
        
        elif rule.reward_type == "DISCOUNT_PERCENT":
            # reward_value is percentage (e.g., 20 for 20%)
            discount = float(transaction.amount) * (reward_value / 100.0)
            discount = round(discount, 2)
            if discount > 0:
                result.discount_amount += Decimal(str(discount))
                result.applied_rule_ids.append(str(rule.id))
                result.applied_rules.append({
                    "rule_id": str(rule.id),
                    "rule_name": rule.name,
                    "reward_type": "DISCOUNT_PERCENT",
                    "discount": discount
                })
        
        elif rule.reward_type == "FREE_MONTHS":
            months = int(reward_value)
            if months > 0:
                result.free_months += months
                result.applied_rule_ids.append(str(rule.id))
                result.applied_rules.append({
                    "rule_id": str(rule.id),
                    "rule_name": rule.name,
                    "reward_type": "FREE_MONTHS",
                    "months": months
                })
    
    return result

