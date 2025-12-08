from fastapi import APIRouter, Depends
from app.dependencies import get_current_business

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
