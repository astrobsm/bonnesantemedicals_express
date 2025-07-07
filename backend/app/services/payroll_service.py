from sqlalchemy.orm import Session

def list_payrolls(db: Session):
    return db.query(PayrollModel).all()
from sqlalchemy.orm import Session
from app.schemas.payroll import PayrollCreate, Payroll
from app.db.models.payroll import Payroll as PayrollModel

def create_payroll(db: Session, payroll: PayrollCreate) -> Payroll:
    db_payroll = PayrollModel(**payroll.dict())
    db.add(db_payroll)
    db.commit()
    db.refresh(db_payroll)
    return db_payroll

def get_payroll(db: Session, payroll_id: int) -> Payroll:
    return db.query(PayrollModel).filter(PayrollModel.id == payroll_id).first()