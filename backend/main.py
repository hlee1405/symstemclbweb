from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, equipment, request, statistics, notification_read

app = FastAPI()

# Cho phép frontend gọi API từ domain khác
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Có thể thay * bằng domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn các router vào app
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(request.router, prefix="/api/request", tags=["Request"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["Statistics"])
app.include_router(notification_read.router, prefix="/api/notification-read", tags=["NotificationRead"])

@app.get("/")
def root():
    return {"message": "Borrowing Management System API is running!"}
