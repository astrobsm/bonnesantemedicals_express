from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class Settings(Base):
    __tablename__ = 'settings'

    id = Column(Integer, primary_key=True, index=True)
    page_name = Column(String, unique=True, nullable=False)
    background_image = Column(Text, nullable=True)  # Base64 or URL of the image
    font_family = Column(String, nullable=True)  # Font family for the page
    theme = Column(String, nullable=True)  # Theme name (e.g., light, dark)