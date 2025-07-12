import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))  # Add `backend/app` to sys.path

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from app.db.base import Base
from app.db import models  # Import the whole models package to ensure all models are loaded
import logging
alembic_logger = logging.getLogger('alembic.runtime.migration')
alembic_logger.info('DEBUG Alembic Base.metadata.tables: %s', list(Base.metadata.tables.keys()))
print('Alembic sees tables at migration time:', list(Base.metadata.tables.keys()))

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

from app.core.config import settings

# Patch Alembic config to ensure correct DB URL (handles env and prefix fix)
db_url = settings.DATABASE_URL
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode with enhanced connection handling."""
    
    # Enhanced configuration for DigitalOcean PostgreSQL
    configuration = config.get_section(config.config_ini_section)
    
    # Add connection timeout and SSL settings
    db_url = configuration.get('sqlalchemy.url', settings.DATABASE_URL)
    
    # Ensure SSL mode for DigitalOcean
    if 'ondigitalocean.com' in db_url and 'sslmode=' not in db_url:
        separator = '&' if '?' in db_url else '?'
        db_url = f"{db_url}{separator}sslmode=require"
        configuration['sqlalchemy.url'] = db_url
    
    # Enhanced connection arguments
    configuration.update({
        'sqlalchemy.connect_args': {
            'connect_timeout': 20,
            'application_name': 'AstroBSM-Alembic',
            'options': '-c statement_timeout=60000'  # 60 second statement timeout for migrations
        }
    })
    
    connectable = engine_from_config(
        configuration,
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,  # No connection pooling for migrations
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()