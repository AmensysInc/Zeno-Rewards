from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.dependencies import get_current_business, get_db
from app.routers.customers.cust_models import Customer
from app.routers.rewards.points_models import PointsHistory
from app.routers.rewards.redemption_models import Redemption

router = APIRouter()


@router.get("/dashboard")
def business_dashboard(current: dict = Depends(get_current_business)):
    """Business dashboard - placeholder for now"""
    business = current["business"]
    return {
        "message": "Welcome to your business dashboard",
        "business_name": business.name,
        "business_id": str(business.id)
    }


@router.get("/analytics")
def business_analytics(
    current: dict = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    """Basic analytics for a business dashboard."""
    business_id = UUID(current["user"]["business_id"])

    total_customers = db.query(Customer).filter(Customer.business_id == business_id).count()
    total_points_issued = (
        db.query(PointsHistory)
        .filter(PointsHistory.business_id == business_id, PointsHistory.points > 0)
        .all()
    )
    total_points_redeemed = (
        db.query(PointsHistory)
        .filter(PointsHistory.business_id == business_id, PointsHistory.points < 0)
        .all()
    )

    issued_sum = sum(p.points for p in total_points_issued)
    redeemed_sum = -sum(p.points for p in total_points_redeemed)

    top_offers = (
        db.query(Redemption.offer_id)
        .filter(Redemption.business_id == business_id)
        .all()
    )

    return {
        "total_customers": total_customers,
        "points_issued": issued_sum,
        "points_redeemed": redeemed_sum,
        "redemptions_count": len(top_offers),
    }
