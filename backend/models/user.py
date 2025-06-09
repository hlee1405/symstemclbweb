from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    student = "student"

class User(BaseModel):
    username: str
    password: str
    role: UserRole