"""add user_activity table for tracking user activity

Revision ID: 20250706_user_activity
Revises: 
Create Date: 2025-07-06
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250706_user_activity'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'user_activity',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('activity_type', sa.String, nullable=False),
        sa.Column('timestamp', sa.DateTime, nullable=False),
        sa.Column('details', sa.String, nullable=True),
    )
    op.create_index('ix_user_activity_user_id', 'user_activity', ['user_id'])

def downgrade():
    op.drop_index('ix_user_activity_user_id', table_name='user_activity')
    op.drop_table('user_activity')
