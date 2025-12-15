from datetime import datetime
import json
from typing import Optional

from sqlalchemy.orm import Session

from app.routers.notifications.notification_models import Notification


def queue_notification(
    db: Session,
    *,
    customer_id,
    channel: str,
    type: str,
    payload: dict,
):
    """Simple abstraction to store notifications; actual sending can be wired later."""
    notif = Notification(
        customer_id=customer_id,
        channel=channel,
        type=type,
        payload=json.dumps(payload),
        status="pending",
        created_at=datetime.utcnow(),
    )
    db.add(notif)
    # caller commits
    return notif


