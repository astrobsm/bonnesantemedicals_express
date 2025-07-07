"""add warehouse transfer table

Revision ID: warehouse_transfer_20250707
Revises: 
Create Date: 2025-07-07

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'warehouse_transfers',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('from_warehouse_id', sa.Integer(), sa.ForeignKey('warehouses.id'), nullable=False),
        sa.Column('to_warehouse_id', sa.Integer(), sa.ForeignKey('warehouses.id'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('warehouse_transfers')
