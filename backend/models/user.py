# from pydantic import BaseModel
# from typing import Literal

# class User(BaseModel):
#     username: str
#     password: str
#     role: Literal["admin", "student"]

from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    student = "student"

class User(BaseModel):
    username: str
    password: str
    role: UserRole