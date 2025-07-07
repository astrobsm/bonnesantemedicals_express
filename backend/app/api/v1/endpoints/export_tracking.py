from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.export_tracking import ExportTracking

router = APIRouter()

@router.get("/export-tracking")
def get_export_tracking_logs(db: Session = Depends(get_db)):
    logs = db.query(ExportTracking).all()
    return logs