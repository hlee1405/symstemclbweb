from pydantic import BaseModel

class NotificationRead(BaseModel):
    userId: str
    notificationId: str
    readAt: str 