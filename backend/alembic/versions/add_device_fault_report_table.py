"""
Revision ID: add_device_fault_report_table
Revises: add_attendance_table_20250608
Create Date: 2025-06-08
"""
from alembic import op
import sqlalchemy as sa

revision = 'add_device_fault_report_table_20250608'
down_revision = 'add_attendance_table_20250608'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'device_fault_reports',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('device_id', sa.Integer, sa.ForeignKey('devices.id'), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('fault_nature', sa.String, nullable=False),
        sa.Column('action_required', sa.String, nullable=False)
    )

def downgrade():
    op.drop_table('device_fault_reports')
