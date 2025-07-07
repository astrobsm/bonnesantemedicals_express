from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.reports import ProductionAnalysisResponse
from app.db.models.production_analysis import ProductionAnalysis

router = APIRouter()

@router.get("/production-analysis", response_model=list[ProductionAnalysisResponse])
def get_production_analysis(db: Session = Depends(get_db)):
    return db.query(ProductionAnalysis).all()