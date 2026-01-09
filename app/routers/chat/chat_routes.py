from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import SessionLocal
from app.dependencies import get_current_customer
from app.routers.customers.cust_models import Customer
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.redeemable_offer_models import RedeemableOffer
from app.routers.rewards.points_ledger_models import PointsLedger
from sqlalchemy import or_, and_
from datetime import datetime
from uuid import UUID

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


def get_customer_context(db: Session, customer_id: str):
    """Get customer context for AI responses"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return None
    
    # Get customer points
    points_balance = 0
    points_ledger = db.query(PointsLedger).filter(
        PointsLedger.customer_id == customer_id
    ).order_by(PointsLedger.created_at.desc()).first()
    if points_ledger:
        points_balance = points_ledger.balance
    
    # Get active offers
    active_offers = db.query(Offer).filter(
        and_(
            Offer.is_active == True,
            or_(
                Offer.start_date == None,
                Offer.start_date <= datetime.utcnow()
            ),
            or_(
                Offer.end_date == None,
                Offer.end_date >= datetime.utcnow()
            )
        )
    ).all()
    
    # Get redeemable offers
    redeemable_offers = db.query(RedeemableOffer).filter(
        and_(
            RedeemableOffer.customer_id == customer_id,
            RedeemableOffer.is_redeemed == False
        )
    ).all()
    
    return {
        "customer": customer,
        "points_balance": points_balance,
        "active_offers": active_offers,
        "redeemable_offers": redeemable_offers
    }


def generate_ai_response(user_message: str, context: dict) -> str:
    """Generate AI response based on user message and customer context"""
    message_lower = user_message.lower().strip()
    
    # Points-related queries
    if any(keyword in message_lower for keyword in ['point', 'balance', 'how many point', 'my point']):
        points = context.get('points_balance', 0)
        return f"You currently have {points} points in your account. You can use these points to redeem offers and rewards!"
    
    # Offers-related queries
    if any(keyword in message_lower for keyword in ['offer', 'discount', 'promotion', 'deal', 'special']):
        active_offers = context.get('active_offers', [])
        redeemable_offers = context.get('redeemable_offers', [])
        
        if redeemable_offers:
            response = "You have special redeemable offers available! 🎁\n\n"
            for ro in redeemable_offers[:3]:  # Show up to 3
                if ro.reward_type == "DISCOUNT_PERCENT":
                    response += f"• {ro.reward_value}% Discount (Member Special)\n"
                elif ro.reward_type == "FREE_WASH":
                    response += f"• Free Car Wash (Non-Member Special)\n"
                else:
                    response += f"• Special Offer Available\n"
            response += "\nCheck your dashboard to redeem these offers!"
        elif active_offers:
            response = f"We have {len(active_offers)} active offers available! 🎉\n\n"
            for offer in active_offers[:3]:  # Show up to 3
                response += f"• {offer.name or 'Special Offer'}\n"
            response += "\nVisit the Offers page to see all available offers!"
        else:
            response = "Currently, there are no active offers. Check back soon for new promotions!"
        return response
    
    # Redemption queries
    if any(keyword in message_lower for keyword in ['redeem', 'how to redeem', 'claim', 'use offer']):
        return "To redeem an offer:\n1. Go to your Dashboard\n2. Look for 'Special Offer Available' section\n3. Click 'Redeem Now' button\n4. Visit our location and show the redemption code to our staff\n\nIf you have questions, feel free to ask!"
    
    # Transaction queries
    if any(keyword in message_lower for keyword in ['transaction', 'wash', 'visit', 'history', 'past']):
        return "You can view all your transactions on your Dashboard. Each transaction shows:\n• Date and time\n• Service details\n• Points earned\n• Amount paid\n\nYour transaction history helps you track your rewards progress!"
    
    # Member/Plan queries
    if any(keyword in message_lower for keyword in ['member', 'membership', 'plan', 'silver', 'gold', 'platinum', 'diamond']):
        customer = context.get('customer')
        if customer:
            plan = customer.plan or "N/A"
            if plan.upper() != "N/A":
                return f"You are a {plan} plan member! As a member, you enjoy:\n• Special discounts\n• Priority service\n• Exclusive offers\n• Points on every visit\n\nThank you for being a valued member!"
            else:
                return "You're currently a non-member. To become a member, please contact our staff or visit our location. Members enjoy exclusive benefits and rewards!"
        return "I can help you learn about our membership plans. We offer Silver, Gold, Platinum, and Diamond plans with various benefits!"
    
    # Greeting queries
    if any(keyword in message_lower for keyword in ['hello', 'hi', 'hey', 'greeting']):
        customer = context.get('customer')
        name = customer.name if customer and customer.name else "there"
        return f"Hello {name}! 👋 I'm here to help you with:\n• Finding offers and promotions\n• Checking your points balance\n• Understanding your rewards\n• Answering questions about transactions\n• General support\n\nWhat would you like to know?"
    
    # Help queries
    if any(keyword in message_lower for keyword in ['help', 'what can you do', 'how can you help']):
        return "I can help you with:\n\n📊 **Account Info**\n• Check your points balance\n• View your membership status\n• See your transaction history\n\n🎁 **Offers & Rewards**\n• Find available offers\n• Check redeemable offers\n• Learn how to redeem rewards\n\n❓ **General Support**\n• Answer questions about our services\n• Explain how the rewards program works\n• Provide information about membership plans\n\nJust ask me anything!"
    
    # How it works queries
    if any(keyword in message_lower for keyword in ['how does it work', 'how do i earn', 'earn point', 'get point']):
        return "Here's how our rewards program works:\n\n1. **Earn Points**: Get points with every car wash visit\n2. **Accumulate**: Points add up in your account\n3. **Redeem**: Use points for discounts and special offers\n4. **Special Offers**: After 4 washes, unlock special 5th wash offers!\n\nMembers get additional benefits and discounts. Keep visiting to earn more rewards!"
    
    # Default response
    return "I'm here to help! I can assist you with:\n• Your points balance\n• Available offers\n• How to redeem rewards\n• Transaction history\n• Membership information\n\nTry asking me about your points, offers, or how the rewards program works!"


@router.post("/message", response_model=ChatResponse)
def chat_message(
    chat_data: ChatMessage,
    current: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """Handle chat messages from customers"""
    try:
        customer_id = current["customer"].id
        
        # Get customer context
        context = get_customer_context(db, str(customer_id))
        if not context:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Generate AI response
        response = generate_ai_response(chat_data.message, context)
        
        return ChatResponse(response=response)
    
    except Exception as e:
        import traceback
        print(f"Chat error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat message: {str(e)}"
        )

