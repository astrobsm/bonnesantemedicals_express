"""merge heads

Revision ID: 327551fb944c
Revises: 20250706_user_activity, 479fe90ad39d
Create Date: 2025-07-06 13:58:21.805159

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '327551fb944c'
down_revision = ('20250706_user_activity', '479fe90ad39d')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
