import os
import psycopg2

# Database connection details (update if needed)
DB_NAME = os.environ.get('PGDATABASE', 'bonnesantemedical_db')
DB_USER = os.environ.get('PGUSER', 'astrobsm')
DB_PASSWORD = os.environ.get('PGPASSWORD', 'WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT')
DB_HOST = os.environ.get('PGHOST', 'dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com')
DB_PORT = os.environ.get('PGPORT', '5432')

def alter_alembic_version_column():
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
            ALTER TABLE alembic_version ALTER COLUMN version_num TYPE VARCHAR(128);
        """)
        print("alembic_version.version_num column altered to VARCHAR(128).")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    alter_alembic_version_column()
