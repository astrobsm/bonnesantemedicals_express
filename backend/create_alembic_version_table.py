import os
import psycopg2
import sqlalchemy as sa
from sqlalchemy import create_engine, text

# Database connection details (update if needed)
DB_NAME = os.environ.get('PGDATABASE', 'bonnesantemedical_db')
DB_USER = os.environ.get('PGUSER', 'astrobsm')
DB_PASSWORD = os.environ.get('PGPASSWORD', 'WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT')
DB_HOST = os.environ.get('PGHOST', 'dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com')
DB_PORT = os.environ.get('PGPORT', '5432')

# The base revision for your Alembic migrations
BASE_REVISION = 'ad8368bfe416'

def create_alembic_version_table():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS alembic_version (
                version_num VARCHAR(128) NOT NULL
            );
        """)
        cur.execute("DELETE FROM alembic_version;")
        cur.execute("INSERT INTO alembic_version (version_num) VALUES (%s);", (BASE_REVISION,))
        print(f"alembic_version table created and set to base revision: {BASE_REVISION}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

def recreate_alembic_version_table():
    engine = create_engine(f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}')
    with engine.connect() as conn:
        conn.execute(text('DROP TABLE IF EXISTS alembic_version'))
        conn.execute(text('CREATE TABLE alembic_version (version_num VARCHAR(128) NOT NULL)'))
        conn.execute(text(f"INSERT INTO alembic_version (version_num) VALUES ('{BASE_REVISION}')"))
        print(f'alembic_version table recreated and set to base revision: {BASE_REVISION}')

if __name__ == "__main__":
    recreate_alembic_version_table()
