from fastapi import APIRouter

router = APIRouter()

# Include your version 1 endpoints here
from .v1.endpoints import auth, registration, inventory, payroll, reports

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(registration.router, prefix="/registration", tags=["registration"])
router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
router.include_router(payroll.router, prefix="/payroll", tags=["payroll"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])