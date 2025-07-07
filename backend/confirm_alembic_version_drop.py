# confirm_alembic_version_drop.py
from sqlalchemy import create_engine, inspect
import os

# Update the database name to 'astrobsm_oracle'
DATABASE_URL = 'postgresql://postgres:natiss_natiss@localhost:5432/astrobsm_oracle'
engine = create_engine(DATABASE_URL)

inspector = inspect(engine)
tables = inspector.get_table_names()

if 'alembic_version' in tables:
    print('alembic_version table EXISTS.')
else:
    print('alembic_version table is DROPPED.')

print('All tables in DB:', tables)
