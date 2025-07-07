# drop_alembic_version.py
"""
This script drops the alembic_version table from your database. Use with caution!
"""
import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE;"))
    print("Dropped alembic_version table.")
