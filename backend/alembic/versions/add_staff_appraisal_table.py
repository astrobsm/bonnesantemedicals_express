"""
Revision ID: add_staff_appraisal_table
Revises: add_logo_pdf_url_to_invoices_20250608
Create Date: 2025-06-08
"""
from alembic import op
import sqlalchemy as sa

revision = 'add_staff_appraisal_table_20250608'
down_revision = 'add_logo_pdf_url_to_invoices_20250608'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'staff_appraisals',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('staff_id', sa.Integer, sa.ForeignKey('staff.id'), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('score', sa.Float, nullable=False),
        sa.Column('remarks', sa.String, nullable=True),
        sa.Column('appraiser', sa.String, nullable=True)
    )

def downgrade():
    op.drop_table('staff_appraisals')
