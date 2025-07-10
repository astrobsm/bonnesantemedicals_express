from sqlalchemy import create_engine, text

# Use the correct connection string for your Render Postgres instance
engine = create_engine('os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost/astrobsm_db')')

with engine.connect() as conn:
    # Create alembic_version table if it doesn't exist
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS alembic_version (
            version_num VARCHAR(128) NOT NULL
        );
    """))
    # Remove any existing version (safety)
    conn.execute(text("DELETE FROM alembic_version;"))
    # Insert the latest revision
    conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('ad8368bfe416')"))
    print('alembic_version table created and set to base revision: ad8368bfe416')
