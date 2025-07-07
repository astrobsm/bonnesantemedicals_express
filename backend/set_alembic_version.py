from sqlalchemy import create_engine, text

# Use the correct connection string for your Render Postgres instance
engine = create_engine('postgresql://astrobsm:WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT@dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com/bonnesantemedical_db')

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
