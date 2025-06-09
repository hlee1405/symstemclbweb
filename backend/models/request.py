from pydantic import BaseModel
from typing import Optional

class BorrowRequest(BaseModel):
    id: Optional[str] = None
    userId: str
    userName: str
    equipmentId: str
    equipmentName: str
    quantity: int
    requestDate: str
    borrowDate: Optional[str] = None
    returnDate: Optional[str] = None
    actualBorrowDate: Optional[str] = None
    actualReturnDate: Optional[str] = None
    status: str
    notes: Optional[str] = None