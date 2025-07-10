# print_metadata_tables.py
"""
This script prints all table names in the connected PostgreSQL database.
"""
from sqlalchemy import create_engine, inspect

# Use the same DB URL as drop_all_tables.py
DATABASE_URL = "os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost/astrobsm_db')"

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)
tables = inspector.get_table_names()

if tables:
    print("Tables in the database:")
    for table in tables:
        print(f"- {table}")
else:
    print("No tables found in the database.")
