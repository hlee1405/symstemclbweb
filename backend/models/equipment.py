from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Equipment(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: str
    totalQuantity: int
    availableQuantity: int
    imageUrl: Optional[str] = None
    status: str
    condition: str
    createdAt: Optional[str] = None