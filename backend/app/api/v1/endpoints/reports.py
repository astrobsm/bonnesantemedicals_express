from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.reports import SalesReport, ProductionReport, StaffPerformanceReport, SalaryReportResponse
from app.services.reports_service import ReportsService
from app.schemas.user_activity_report import UserActivityReport

router = APIRouter()

@router.get("/sales", response_model=SalesReport)
def get_sales_report(start_date: str, end_date: str, db: Session = Depends(get_db)):
    return ReportsService.get_sales_report(db, start_date, end_date)

@router.get("/production", response_model=ProductionReport)
def get_production_report(start_date: str, end_date: str, db: Session = Depends(get_db)):
    return ReportsService.get_production_report(db, start_date, end_date)

@router.get("/staff-performance", response_model=UserActivityReport)
def get_staff_performance_report(db: Session = Depends(get_db)):
    """Endpoint to fetch user activity report (all users, activity level)."""
    return ReportsService.get_staff_performance_report(db)

@router.get("/salary-report", response_model=SalaryReportResponse)
def get_salary_report(db: Session = Depends(get_db)):
    """Endpoint to fetch salary report."""
    return ReportsService.generate_salary_report(db)