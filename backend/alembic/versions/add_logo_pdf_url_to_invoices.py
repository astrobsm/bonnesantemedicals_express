"""
Add logo_url and pdf_url columns to invoices table
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_logo_pdf_url_to_invoices_20250608'
down_revision = 'add_device_fault_report_table_20250608'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('invoices', sa.Column('logo_url', sa.String(), nullable=True))
    op.add_column('invoices', sa.Column('pdf_url', sa.String(), nullable=True))

def downgrade():
    op.drop_column('invoices', 'logo_url')
    op.drop_column('invoices', 'pdf_url')
