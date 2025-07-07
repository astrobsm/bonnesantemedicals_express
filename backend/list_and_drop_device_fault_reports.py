import os
import psycopg2

# Database connection details (update if needed)
DB_NAME = os.environ.get('PGDATABASE', 'bonnesantemedical_db')
DB_USER = os.environ.get('PGUSER', 'astrobsm')
DB_PASSWORD = os.environ.get('PGPASSWORD', 'WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT')
DB_HOST = os.environ.get('PGHOST', 'dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com')
DB_PORT = os.environ.get('PGPORT', '5432')

def list_and_drop_device_fault_reports():
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
        print("Listing all device_fault_reports tables by schema:")
        cur.execute("""
            SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'device_fault_reports';
        """)
        rows = cur.fetchall()
        if not rows:
            print("No device_fault_reports table found in any schema.")
        else:
            for schema, table in rows:
                print(f"Found: {schema}.{table}")
                cur.execute(f'DROP TABLE IF EXISTS "{schema}"."{table}" CASCADE;')
                print(f"Dropped: {schema}.{table}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    list_and_drop_device_fault_reports()
