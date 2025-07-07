"""
Revision ID: 20250612_returned_products_table
Revises: 
Create Date: 2025-06-12
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250612_returned_products_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'returned_products',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('batch_no', sa.String(), nullable=True),
        sa.Column('manufacturing_date', sa.Date(), nullable=True),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('date_of_return', sa.Date(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('receiving_staff_id', sa.Integer(), sa.ForeignKey('staff.id'), nullable=False)
    )

def downgrade():
    op.drop_table('returned_products')
