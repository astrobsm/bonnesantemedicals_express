from sqlalchemy import create_engine
from app.db.base import Base  # Import Base where models are registered
from app.db.models.settings import Settings  # Ensure the new model is imported

DATABASE_URL = "postgresql+psycopg2://postgres:natiss_natiss@localhost/astrobsm_oracle"
engine = create_engine(DATABASE_URL)

# Create all tables defined in the models
Base.metadata.create_all(engine)  # DISABLED: Use Alembic for migrations
print("Tables created!")