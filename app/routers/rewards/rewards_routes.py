from fastapi import APIRouter, Depends
from app.database import SessionLocal
from app.routers.rewards.offers_models import Offer
from app.routers.rewards.points_models import PointsHistory
from sqlalchemy.orm import Session

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/offers/create")
def create_offer(business_id: str, title: str, description: str, points_required: int, db: Session = Depends(get_db)):
    offer = Offer(
        business_id=business_id,
        title=title,
        description=description,
        points_required=points_required
    )
    db.add(offer)
    db.commit()
    return {"message": "Offer created"}


@router.get("/offers/{business_id}")
def get_offers(business_id: str, db: Session = Depends(get_db)):
    return db.query(Offer).filter(Offer.business_id == business_id).all()
