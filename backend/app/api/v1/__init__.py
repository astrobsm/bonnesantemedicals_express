from fastapi import APIRouter

api_router = APIRouter()

# Import and include endpoint routers
from .endpoints.payroll import router as payroll_router
from .endpoints.inventory import router as inventory_router
from .endpoints import suppliers, staff, settings, customers, warehouses, products, registration, invoices, customer_performance, product_stock_intake, raw_material_stock_intake, production_requirements, health
from .endpoints import reports
from .endpoints.devices import router as devices_router
from .endpoints.device_maintenance import router as device_maintenance_router
from .endpoints import auth
from .endpoints import production_console
from .endpoints import production_output
from .endpoints.hours_worked import router as hours_worked_router
from .endpoints.attendance import router as attendance_router
from .endpoints.appraisal import router as appraisal_router
from .endpoints.device_fault_report import router as device_fault_report_router
from app.api.v1.endpoints.warehouse_transfer import router as warehouse_transfer_router
from .endpoints import returned_products
from .endpoints.fingerprint import router as fingerprint_router
# Add other endpoint imports as needed

api_router.include_router(health.router, prefix="/health", tags=["Health"])

api_router.include_router(payroll_router, tags=["payroll"])
api_router.include_router(inventory_router, prefix="/inventory", tags=["inventory"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(staff.router, prefix="/staff", tags=["Staff"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["Warehouses"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(registration.router, prefix="/registration", tags=["Registration"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(customer_performance.router, prefix="/customer-performance", tags=["Customer Performance"])
api_router.include_router(customer_performance.router, prefix="/customers-performance", tags=["Customer Performance Alias"])
api_router.include_router(product_stock_intake.router, prefix="/product-stock-intake", tags=["Product Stock Intake"])
api_router.include_router(raw_material_stock_intake.router, prefix="/raw-material-stock-intake", tags=["Raw Material Stock Intake"])
api_router.include_router(raw_material_stock_intake.router, tags=["Raw Material Stock Level"])
api_router.include_router(production_requirements.router, prefix="/production-requirements", tags=["Production Requirements"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(reports.router, tags=["Reports"])
api_router.include_router(devices_router, prefix="/devices", tags=["Devices"])
api_router.include_router(device_maintenance_router, prefix="/device-maintenance", tags=["Device Maintenance"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(production_console.router, prefix="/production-console", tags=["Production Console"])
api_router.include_router(production_output.router, prefix="/production-output", tags=["Production Output"])
api_router.include_router(hours_worked_router, tags=["Hours Worked"])
api_router.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(appraisal_router, prefix="/appraisal", tags=["Appraisal"])
api_router.include_router(device_fault_report_router, prefix="/device-fault-reporting", tags=["Device Fault Reporting"])
api_router.include_router(warehouse_transfer_router, tags=["Warehouse Transfer"])
api_router.include_router(returned_products.router, prefix="/returned-products", tags=["Returned Products"])
api_router.include_router(fingerprint_router, tags=["Fingerprint"])
# Include other routers as needed