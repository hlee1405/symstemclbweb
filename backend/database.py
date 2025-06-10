# from motor.motor_asyncio import AsyncIOMotorClient
# import os

# MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
# client = AsyncIOMotorClient(MONGO_URL)

# db = client["quanlydb"]

from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()  # Tải biến môi trường từ file .env
MONGO_URL = os.getenv("MONGO_URL")  # Đúng với tên trong .env
client = AsyncIOMotorClient(MONGO_URL)

db = client["quanlydb"]
