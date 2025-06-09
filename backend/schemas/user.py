from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    student = "student"

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    username: str
    role: UserRole