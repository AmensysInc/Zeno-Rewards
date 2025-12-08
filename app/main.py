from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Import all models so SQLAlchemy creates tables
from app.routers.organizations.org_models import Organization
from app.routers.businesses.biz_models import Business
from app.routers.customers.cust_models import Customer
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.points_models import PointsHistory
from app.routers.admin.admin_models import Admin
from app.routers.transactions.transaction_models import Transaction

from app.routers.auth.auth_routes import router as auth_router
from app.routers.organizations.org_routes import router as org_router
from app.routers.businesses.biz_routes import router as biz_router
from app.routers.customers.cust_routes import router as cust_router
from app.routers.rewards.rewards_routes import router as rewards_router
from app.routers.admin.admin_routes import router as admin_router
from app.routers.transactions.transaction_routes import router as transaction_router

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CREATE TABLES
Base.metadata.create_all(bind=engine)

# API ROUTES
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(org_router, prefix="/organizations", tags=["Organizations"])
app.include_router(biz_router, prefix="/businesses", tags=["Businesses"])
app.include_router(cust_router, prefix="/customers", tags=["Customers"])
app.include_router(rewards_router, prefix="/rewards", tags=["Rewards"])
app.include_router(transaction_router, prefix="/transactions", tags=["Transactions"])
