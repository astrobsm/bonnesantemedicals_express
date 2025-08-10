from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class FingerprintTemplate(Base):
    __tablename__ = 'fingerprint_templates'

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey('staff.id'), nullable=False, unique=True)
    template_data = Column(Text, nullable=False)  # Base64 encoded template
    finger_position = Column(Integer, default=1)  # 1-10 for different fingers
    quality_score = Column(Integer, nullable=False)
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    staff = relationship('Staff', backref='fingerprint_template')
    creator = relationship('User', foreign_keys=[created_by])
