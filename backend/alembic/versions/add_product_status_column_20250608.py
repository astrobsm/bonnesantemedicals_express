"""
Add status column to products table for dynamic product status (Green/Amber/Red)
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_product_status_column_20250608'
down_revision = 'c331c0ee4c80'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('products', sa.Column('status', sa.String(), nullable=False, server_default='Green'))

def downgrade():
    op.drop_column('products', 'status')
