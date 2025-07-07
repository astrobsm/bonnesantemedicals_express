"""merge heads

Revision ID: 479fe90ad39d
Revises: 20250612_returned_products_table, d7f26d3030fd
Create Date: 2025-06-14 11:44:18.453976

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '479fe90ad39d'
down_revision = ('20250612_returned_products_table', 'd7f26d3030fd')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
