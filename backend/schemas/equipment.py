from pydantic import BaseModel
from typing import Optional

class EquipmentIn(BaseModel):
    name: str
    description: Optional[str]
    category: str
    totalQuantity: int
    availableQuantity: int
    imageUrl: Optional[str]
    status: str
    condition: str
    createdAt: Optional[str] = None

class EquipmentOut(EquipmentIn):
    id: str