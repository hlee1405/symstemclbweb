from fastapi import APIRouter, HTTPException
from database import db
from schemas.equipment import EquipmentIn, EquipmentOut
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=EquipmentOut)
async def add_equipment(equipment: EquipmentIn):
    doc = equipment.dict()
    doc["id"] = str(uuid.uuid4())  # Sinh id dạng chuỗi duy nhất
    doc["createdAt"] = datetime.utcnow().isoformat()  # Add creation timestamp
    await db.equipment.insert_one(doc)
    return EquipmentOut(**doc)

@router.get("/", response_model=list[EquipmentOut])
async def list_equipment():
    equipments = []
    async for eq in db.equipment.find().sort("createdAt", -1):  # Sort by createdAt in descending order
        eq["id"] = str(eq.get("id", ""))
        eq.pop("_id", None)
        equipments.append(EquipmentOut(**eq))
    return equipments

@router.get("/{id}", response_model=EquipmentOut)
async def get_equipment(id: str):
    eq = await db.equipment.find_one({"id": id})
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    eq["id"] = str(eq.get("id", ""))
    eq.pop("_id", None)
    return EquipmentOut(**eq)

@router.put("/{id}", response_model=EquipmentOut)
async def update_equipment(id: str, equipment: EquipmentIn):
    result = await db.equipment.update_one({"id": id}, {"$set": equipment.dict()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    eq = await db.equipment.find_one({"id": id})
    eq["id"] = str(eq.get("id", ""))
    eq.pop("_id", None)
    return EquipmentOut(**eq)

@router.delete("/{id}")
async def delete_equipment(id: str):
    result = await db.equipment.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted"}