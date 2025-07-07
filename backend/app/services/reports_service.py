# Placeholder for reports_service.py
# Implement the necessary service functions for handling reports here.

from sqlalchemy.orm import Session
from app.db.models.payroll import Payroll
from app.db.models.staff import Staff
from app.db.models.invoice import Invoice
from app.db.models.user import User
from app.db.models.user_activity import UserActivity
from app.schemas.reports import SalaryReportResponse, StaffPerformanceReport, StaffPerformanceItem, SalesReport
from app.schemas.invoices import InvoiceOut
from app.schemas.user_activity_report import UserActivityReport, UserActivityItem
from sqlalchemy import func

class ReportsService:
    def generate_sales_report(self):
        # Add logic to generate sales report
        pass

    def generate_production_report(self):
        # Add logic to generate production report
        pass

    def generate_staff_performance_report(self):
        # Add logic to generate staff performance report
        pass

    def generate_salary_report(self, db: Session) -> SalaryReportResponse:
        """Generate a salary report by aggregating payroll data."""
        payroll_data = db.query(Payroll).all()

        total_salary = sum(item.salary for item in payroll_data)
        total_bonus = sum(item.bonus for item in payroll_data)
        total_deductions = sum(item.deductions for item in payroll_data)

        return SalaryReportResponse(
            total_salary=total_salary,
            total_bonus=total_bonus,
            total_deductions=total_deductions,
            total_net_salary=total_salary + total_bonus - total_deductions
        )

    @staticmethod
    def get_staff_performance_report(db: Session, start_date=None, end_date=None) -> UserActivityReport:
        # Aggregate activity for all users: login, attendance, invoice generation
        users = db.query(User).all()
        user_ids = [u.id for u in users]
        # Query all activities for these users
        activity_counts = (
            db.query(UserActivity.user_id, func.count().label('activity_level'))
            .filter(UserActivity.user_id.in_(user_ids))
            .group_by(UserActivity.user_id)
            .all()
        )
        activity_map = {row.user_id: row.activity_level for row in activity_counts}
        # Compose the report, always include all users
        user_items = []
        for user in users:
            user_items.append(UserActivityItem(
                id=user.id,
                username=user.username,
                role=user.role,
                activity_level=int(activity_map.get(user.id, 0))
            ))
        return UserActivityReport(users=user_items)

    @staticmethod
    def get_sales_report(db: Session, start_date: str, end_date: str) -> SalesReport:
        from datetime import datetime
        from app.schemas.invoices import InvoiceOut, InvoiceItemOut
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        invoices = db.query(Invoice).filter(Invoice.date >= start, Invoice.date <= end).all()
        total_sales = sum(inv.total_amount for inv in invoices)
        total_vat = sum(getattr(inv, 'vat', 0) or 0 for inv in invoices)
        transactions = []
        for inv in invoices:
            items = []
            for item in inv.items:
                # Try to get product name if relationship is loaded
                product_name = getattr(item.product, 'name', None)
                items.append(InvoiceItemOut(
                    id=item.id,
                    product_id=item.product_id,
                    product_name=product_name,
                    quantity=item.quantity,
                    price=item.price
                ))
            invoice_out = InvoiceOut(
                id=inv.id,
                invoice_number=inv.invoice_number,
                customer_name=inv.customer_name,
                date=inv.date.date() if hasattr(inv.date, 'date') else inv.date,
                total_amount=inv.total_amount,
                status=inv.status,
                logo_url=inv.logo_url,
                pdf_url=inv.pdf_url,
                items=items
            )
            transactions.append(invoice_out.model_dump())
        return SalesReport(
            total_sales=total_sales,
            total_vat=total_vat,
            start_date=start.date(),
            end_date=end.date(),
            transactions=transactions
        )