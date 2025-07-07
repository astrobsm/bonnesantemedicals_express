import os
import psycopg2

# Database connection details (update if needed)
DB_NAME = os.environ.get('PGDATABASE', 'bonnesantemedical_db')
DB_USER = os.environ.get('PGUSER', 'astrobsm')
DB_PASSWORD = os.environ.get('PGPASSWORD', 'WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT')
DB_HOST = os.environ.get('PGHOST', 'dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com')
DB_PORT = os.environ.get('PGPORT', '5432')

def drop_device_fault_reports():
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
        cur.execute("DROP TABLE IF EXISTS device_fault_reports CASCADE;")
        print("device_fault_reports table dropped (if it existed).")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    drop_device_fault_reports()
