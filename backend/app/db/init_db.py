from app.db.session import engine
from app.db.base import Base
from app.db.models import customer, supplier, staff, settings, warehouse  # Import all models to register them

def init_db():
    # Base.metadata.create_all(bind=engine)  # DISABLED: Use Alembic for migrations
    pass

if __name__ == "__main__":
    init_db()
    print("✅ Database tables creation skipped. Use Alembic for migrations.")
