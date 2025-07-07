from pydantic import BaseModel
from typing import List, Optional

class UserActivityItem(BaseModel):
    id: int
    username: str
    role: str
    activity_level: int

class UserActivityReport(BaseModel):
    users: List[UserActivityItem]
