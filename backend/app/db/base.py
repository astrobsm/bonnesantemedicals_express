from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Do not import models here to avoid circular imports