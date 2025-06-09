from pydantic import BaseModel
from typing import Optional

class RequestCreate(BaseModel):
    userId: str
    userName: str
    equipmentId: str
    equipmentName: str
    quantity: int
    borrowDate: Optional[str] = None
    returnDate: Optional[str] = None
    notes: Optional[str] = None

class RequestOut(RequestCreate):
    id: str
    requestDate: str
    actualBorrowDate: Optional[str] = None
    actualReturnDate: Optional[str] = None
    status: str