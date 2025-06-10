from fastapi import APIRouter, HTTPException, Depends
from models.user import User
from schemas.user import UserLogin, UserOut
from database import db

router = APIRouter()

@router.post("/admin/login", response_model=UserOut)
async def admin_login(user: UserLogin):
    db_user = await db["users"].find_one({"username": user.username})
    if not db_user or db_user["password"] != user.password or db_user["role"] != "admin":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserOut(username=db_user["username"], role=db_user["role"])

@router.post("/login", response_model=UserOut)
async def student_login(user: UserLogin):
    db_user = await db["users"].find_one({"username": user.username})
    if not db_user or db_user["password"] != user.password or db_user["role"] != "student":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserOut(username=db_user["username"], role=db_user["role"])