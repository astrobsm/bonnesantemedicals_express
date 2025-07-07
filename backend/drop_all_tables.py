# drop_all_tables.py
"""
This script drops all tables in the connected PostgreSQL database. Use with caution!
"""
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.engine import reflection
from sqlalchemy.exc import ProgrammingError
import os
import psycopg2

# Set your Render production DB URL directly here for this operation
DATABASE_URL = "postgresql://astrobsm:WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT@dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com/bonnesantemedical_db"

engine = create_engine(DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

def drop_all_tables():
    conn = psycopg2.connect(
        dbname=os.environ.get('PGDATABASE', 'bonnesantemedical_db'),
        user=os.environ.get('PGUSER', 'astrobsm'),
        password=os.environ.get('PGPASSWORD', 'WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT'),
        host=os.environ.get('PGHOST', 'dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com'),
        port=os.environ.get('PGPORT', '5432')
    )
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                -- Drop all tables in the public schema
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
                END LOOP;
            END $$;
        """)
        print("All tables dropped with CASCADE.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

with engine.connect() as conn:
    trans = conn.begin()
    inspector = reflection.Inspector.from_engine(engine)
    tables = inspector.get_table_names()
    for table in tables:
        try:
            conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE;'))
            print(f"Dropped table: {table}")
        except ProgrammingError as e:
            print(f"Error dropping table {table}: {e}")
    trans.commit()
    # Also drop alembic_version if it exists
    try:
        conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE;'))
        print("Dropped alembic_version table.")
    except Exception as e:
        print(f"Error dropping alembic_version: {e}")
print("All tables dropped.")

if __name__ == "__main__":
    drop_all_tables()
