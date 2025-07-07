from sqlalchemy import create_engine, inspect
import psycopg2

# Replace with your actual PostgreSQL connection string
DATABASE_URL = "postgresql+psycopg2://postgres:natiss_natiss@localhost/astrobsm_oracle"

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

# Print all table names in the database using SQLAlchemy
print("Tables in the database (SQLAlchemy):", inspector.get_table_names())

# Print all table names in the database using psycopg2
conn = psycopg2.connect(
    dbname="astrobsm_oracle",
    user="postgres",
    password="natiss_natiss",
    host="localhost"
)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
tables = cur.fetchall()
print("Tables in database (psycopg2):")
for t in tables:
    print(t[0])
cur.close()
conn.close()