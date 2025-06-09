from fastapi import APIRouter
from database import db

router = APIRouter()

@router.get("/")
async def get_statistics():
    total_equipment = await db.equipment.count_documents({})
    total_requests = await db.requests.count_documents({})
    pending_requests = await db.requests.count_documents({"status": "pending"})
    return {
        "total_equipment": total_equipment,
        "total_requests": total_requests,
        "pending_requests": pending_requests
    }
