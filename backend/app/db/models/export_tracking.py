from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ExportTracking(Base):
    __tablename__ = 'export_tracking'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    export_type = Column(String, nullable=False)  # e.g., CSV, PDF
    timestamp = Column(DateTime, nullable=False)

    user = relationship("User")