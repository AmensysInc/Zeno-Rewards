from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import SessionLocal
from app.dependencies import get_current_business
from app.routers.campaigns.campaign_models import Campaign


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[dict])
def list_campaigns(
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = current["business"].id
    campaigns = db.query(Campaign).filter(Campaign.business_id == business_id).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "bonus_points": c.bonus_points,
            "conditions": c.conditions,
            "active": c.active,
        }
        for c in campaigns
    ]


@router.post("/", response_model=dict)
def create_campaign(
    name: str,
    type: str,
    bonus_points: int,
    conditions: str | None = None,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_business),
):
    business_id = current["business"].id
    campaign = Campaign(
        business_id=business_id,
        name=name,
        type=type,
        bonus_points=bonus_points,
        conditions=conditions,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return {
        "id": campaign.id,
        "name": campaign.name,
        "type": campaign.type,
        "bonus_points": campaign.bonus_points,
    }


