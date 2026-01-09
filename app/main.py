from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.database import Base, engine

# Import all models so SQLAlchemy creates tables
from app.routers.organizations.org_models import Organization
from app.routers.businesses.biz_models import Business
from app.routers.customers.cust_models import Customer
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.points_models import PointsHistory, EarningRule
from app.routers.rewards.points_ledger_models import PointsLedger, PointBalance
from app.routers.admin.admin_models import Admin
from app.routers.transactions.transaction_models import Transaction
from app.routers.businesses.staff_models import Staff
from app.routers.rewards.redemption_models import Redemption
from app.routers.rewards.redeemable_offer_models import RedeemableOffer
from app.routers.campaigns.campaign_models import Campaign
from app.routers.notifications.notification_models import Notification

from app.routers.auth.auth_routes import router as auth_router
from app.routers.organizations.org_routes import router as org_router
from app.routers.businesses.biz_routes import router as biz_router
from app.routers.customers.cust_routes import router as cust_router
from app.routers.rewards.rewards_routes import router as rewards_router
from app.routers.customers.cust_flows import router as cust_flows_router
from app.routers.customers.customer_routes import router as customer_routes_router
from app.routers.admin.admin_routes import router as admin_router
from app.routers.transactions.transaction_routes import router as transaction_router
from app.routers.campaigns.campaign_routes import router as campaigns_router
from app.routers.rewards.points_ledger_routes import router as points_ledger_router
from app.routers.rewards.rule_management_routes import router as rule_management_router
from app.routers.rewards.redeemable_offer_routes import router as redeemable_offer_router
from app.routers.chat.chat_routes import router as chat_router
from app.routers.businesses.staff_routes import router as staff_router
from app.routers.businesses.staff_customer_routes import router as staff_customer_router

app = FastAPI()

# CORS middleware - MUST be added before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global exception handler to ensure CORS headers are always included
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are included even on errors"""
    import traceback
    error_detail = traceback.format_exc()
    print(f"Global error handler: {type(exc).__name__}: {str(exc)}")
    print(error_detail)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# CREATE TABLES
Base.metadata.create_all(bind=engine)

# API ROUTES
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(org_router, prefix="/organizations", tags=["Organizations"])
app.include_router(biz_router, prefix="/businesses", tags=["Businesses"])
app.include_router(cust_router, prefix="/customers", tags=["Customers"])
app.include_router(cust_flows_router, prefix="/business/customers", tags=["Business Customers"])
app.include_router(staff_router, prefix="/business/staff", tags=["Staff Management"])
app.include_router(staff_customer_router, prefix="/staff/customer", tags=["Staff Customer Lookup"])
app.include_router(customer_routes_router, prefix="/customer", tags=["Customer Portal"])
app.include_router(rewards_router, prefix="/rewards", tags=["Rewards"])
app.include_router(transaction_router, prefix="/transactions", tags=["Transactions"])
app.include_router(campaigns_router, prefix="/campaigns", tags=["Campaigns"])
app.include_router(points_ledger_router, prefix="/rewards", tags=["Points Ledger"])
app.include_router(rule_management_router, prefix="/rewards", tags=["Rule Management"])
app.include_router(redeemable_offer_router, prefix="/rewards", tags=["Redeemable Offers"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
