"""
Revision ID: add_attendance_table
Revises: 7973626daea5
Create Date: 2025-06-08
"""
from alembic import op
import sqlalchemy as sa

revision = 'f7b2c1d8e9a0'
down_revision = '7973626daea5'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'attendance_records',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('staff_id', sa.Integer, sa.ForeignKey('staff.id'), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('time_in', sa.DateTime, nullable=True),
        sa.Column('time_out', sa.DateTime, nullable=True),
        sa.Column('hours_worked', sa.Float, nullable=True),
        sa.Column('action', sa.String, nullable=True)
    )

def downgrade():
    op.drop_table('attendance_records')
