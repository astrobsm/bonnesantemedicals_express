import os
import psycopg2
from datetime import datetime

# Database connection details
DB_NAME = os.environ.get('PGDATABASE', 'bonnesantemedical_db')
DB_USER = os.environ.get('PGUSER', 'astrobsm')
DB_PASSWORD = os.environ.get('PGPASSWORD', 'WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT')
DB_HOST = os.environ.get('PGHOST', 'dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com')
DB_PORT = os.environ.get('PGPORT', '5432')

# User activity seed data
seed_data = [
    (1, 'login', 'Admin login'),
    (1, 'attendance', 'Admin attendance'),
    (1, 'invoice', 'Admin generated invoice'),
    (2, 'login', 'User login'),
    (2, 'attendance', 'User attendance'),
    (3, 'login', 'User login'),
    (4, 'login', 'User login'),
    (4, 'attendance', 'User attendance'),
    (4, 'invoice', 'User generated invoice'),
    (4, 'invoice', 'User generated invoice 2'),
]

def seed_user_activity():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        sslmode='require'
    )
    cur = conn.cursor()
    for user_id, activity_type, details in seed_data:
        cur.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, timestamp, details)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, activity_type, datetime.utcnow(), details)
        )
    conn.commit()
    cur.close()
    conn.close()
    print("Seeded user_activity table with sample data.")

if __name__ == "__main__":
    seed_user_activity()
