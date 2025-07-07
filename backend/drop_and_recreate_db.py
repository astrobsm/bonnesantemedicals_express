# drop_and_recreate_db.py
"""
This script drops and recreates the 'astrobsm_oracle' PostgreSQL database.
You must have the 'psycopg2' package installed and permission to drop/create databases.
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine, text
import os

DB_NAME = "astrobsm_oracle"
DB_USER = "postgres"
DB_PASSWORD = "natiss_natiss"
DB_HOST = "localhost"

# Connect to the default database
conn = psycopg2.connect(dbname="postgres", user=DB_USER, password=DB_PASSWORD, host=DB_HOST)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

# Terminate all connections to the target database
cur.execute(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{DB_NAME}';")

# Drop the database
cur.execute(f"DROP DATABASE IF EXISTS {DB_NAME};")
print(f"Dropped database: {DB_NAME}")

# Recreate the database
cur.execute(f"CREATE DATABASE {DB_NAME} OWNER = {DB_USER} ENCODING = 'UTF8' CONNECTION LIMIT = -1;")
print(f"Created database: {DB_NAME}")

cur.close()
conn.close()

# Schema management
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL environment variable not set!")

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    print("Schema dropped and recreated.")

print("Done.")
