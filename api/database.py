from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings

engine = create_engine(
    settings.database_url,
    # Test connections before use so stale pool connections after a DB restart
    # are transparently recycled rather than blowing up with OperationalError.
    pool_pre_ping=True,
    # Recycle connections every 5 minutes to avoid NAT/firewall idle-timeout drops.
    pool_recycle=300,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
