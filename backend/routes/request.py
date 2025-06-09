from fastapi import APIRouter, HTTPException
from database import db
from schemas.request import RequestCreate, RequestOut
import uuid

router = APIRouter()

@router.post("/", response_model=RequestOut)
async def create_request(req: RequestCreate):
    doc = req.dict()
    # Nếu cần, tự động sinh các trường như status, requestDate ở đây
    doc["status"] = "PENDING"
    from datetime import datetime
    doc["requestDate"] = datetime.utcnow().strftime("%Y-%m-%d")
    doc["id"] = str(uuid.uuid4())  # Sinh id dạng chuỗi duy nhất
    await db.requests.insert_one(doc)
    return RequestOut(**doc)

@router.get("/", response_model=list[RequestOut])
async def list_requests():
    requests = []
    async for r in db.requests.find():
        r["id"] = str(r.get("id", ""))
        r.pop("_id", None)
        requests.append(RequestOut(**r))
    return requests

@router.get("/{id}", response_model=RequestOut)
async def get_request(id: str):
    req = await db.requests.find_one({"id": id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req["id"] = str(req.get("id", ""))
    req.pop("_id", None)
    return RequestOut(**req)

@router.put("/{id}/status")
async def update_status(id: str, status: str):
    valid_status = ["PENDING", "APPROVED", "REJECTED", "RETURNED", "OVERDUE", "CANCELED"]
    if status not in valid_status:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Get the request first to check its current status and equipment details
    request = await db.requests.find_one({"id": id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Get the equipment
    equipment = await db.equipment.find_one({"id": request["equipmentId"]})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Update request status
    result = await db.requests.update_one(
        {"id": id},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Update equipment quantity based on status change
    if status == "APPROVED" and request["status"] != "APPROVED":
        # Decrease available quantity when request is approved
        new_quantity = equipment["availableQuantity"] - request["quantity"]
        # Tính trạng thái mới
        if new_quantity == 0:
            new_status = "OUT_OF_STOCK"
        else:
            new_status = "AVAILABLE"
        await db.equipment.update_one(
            {"id": request["equipmentId"]},
            {"$set": {"availableQuantity": new_quantity, "status": new_status}}
        )
    elif status == "RETURNED" and request["status"] != "RETURNED":
        # Increase available quantity when equipment is returned
        new_quantity = equipment["availableQuantity"] + request["quantity"]
        # Tính trạng thái mới
        if new_quantity == 0:
            new_status = "OUT_OF_STOCK"
        else:
            new_status = "AVAILABLE"
        await db.equipment.update_one(
            {"id": request["equipmentId"]},
            {"$set": {"availableQuantity": new_quantity, "status": new_status}}
        )
    
    return {"message": "Status updated"}

@router.delete("/{id}")
async def delete_request(id: str):
    result = await db.requests.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": "Request deleted"}