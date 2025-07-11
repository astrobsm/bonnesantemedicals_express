from pydantic import BaseModel
from typing import Optional

class SettingsBase(BaseModel):
    page_name: str
    background_image: Optional[str] = None
    font_family: Optional[str] = None
    theme: Optional[str] = None

class SettingsCreate(SettingsBase):
    pass

class SettingsOut(SettingsBase):
    id: int

    class Config:
        from_attributes = True
