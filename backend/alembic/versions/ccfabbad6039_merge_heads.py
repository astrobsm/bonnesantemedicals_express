"""merge heads

Revision ID: ccfabbad6039
Revises: add_product_status_column_20250608, add_staff_appraisal_table_20250608
Create Date: 2025-06-08 17:34:59.302449

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ccfabbad6039'
down_revision = ('add_product_status_column_20250608', 'add_staff_appraisal_table_20250608')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
