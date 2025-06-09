from fastapi import APIRouter, HTTPException
from models.user import User
from schemas.user import UserLogin, UserOut

router = APIRouter()

# Mock user data
fake_users_db = {
    "admin": {"username": "admin", "password": "admin123", "role": "admin"},
    "student": {"username": "student", "password": "student123", "role": "student"}
}

@router.post("/admin/login", response_model=UserOut)
async def admin_login(user: UserLogin):
    db_user = fake_users_db.get(user.username)
    if not db_user or db_user["password"] != user.password or db_user["role"] != "admin":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserOut(username=db_user["username"], role=db_user["role"])

@router.post("/login", response_model=UserOut)
async def student_login(user: UserLogin):
    db_user = fake_users_db.get(user.username)
    if not db_user or db_user["password"] != user.password or db_user["role"] != "student":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserOut(username=db_user["username"], role=db_user["role"])