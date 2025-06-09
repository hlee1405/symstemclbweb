from fastapi import APIRouter
from database import db
from datetime import datetime

router = APIRouter()

@router.get("/{user_id}")
async def get_read_notifications(user_id: str):
    docs = db.notification_read.find({"userId": user_id})
    return [doc["notificationId"] async for doc in docs]

@router.post("/")
async def mark_read(data: dict):
    user_id = data["userId"]
    notification_ids = data["notificationIds"]  # list
    now = datetime.utcnow().isoformat()
    for nid in notification_ids:
        await db.notification_read.update_one(
            {"userId": user_id, "notificationId": nid},
            {"$set": {"readAt": now}},
            upsert=True
        )
    return {"message": "Marked as read"} 