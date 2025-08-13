"""merge migration heads

Revision ID: 58832cc34e67
Revises: 327551fb944c, add_fingerprint_integration
Create Date: 2025-08-13 20:55:27.769611

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '58832cc34e67'
down_revision = ('327551fb944c', 'add_fingerprint_integration')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
