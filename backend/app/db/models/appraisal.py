from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class StaffAppraisal(Base):
    __tablename__ = 'staff_appraisals'

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey('staff.id'), nullable=False)
    date = Column(Date, nullable=False)
    score = Column(Float, nullable=False)
    remarks = Column(String, nullable=True)
    appraiser = Column(String, nullable=True)

    staff = relationship('Staff', backref='appraisals')
