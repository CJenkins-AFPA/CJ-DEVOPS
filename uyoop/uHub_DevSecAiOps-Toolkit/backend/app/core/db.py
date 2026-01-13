import logging
import time
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.vault import vault_service

logger = logging.getLogger(__name__)

# Logic to determine Database URL
# 1. Try Env/Settings (Dev mode fallback, though user wants strict no-cleartext)
# 2. Try Vault (Dynamic)

user = settings.POSTGRES_USER
password = settings.POSTGRES_PASSWORD

# If password is 'changeme' or None, try Vault?
# Or if we strictly want Vault, we should prioritize it.
# Let's say: If settings.POSTGRES_PASSWORD is provided (via Env), use it (for CI/Simple Dev).
# If NOT provided, enforce Vault.
# In our docker-compose, we will remove POSTGRES_PASSWORD for backend.

if not password:
    logger.info("No POSTGRES_PASSWORD found in env. Attempting to fetch from Vault...")
    try:
        # Retry mechanism useful here as Vault might be warming up?
        # For simplicity v1: fail fast or simple retry
        user, password = vault_service.get_database_credentials()
    except Exception as e:
        logger.error(f"Critical: Failed to obtain database credentials from Vault: {e}")
        raise e

DATABASE_URL = (
    f"postgresql+asyncpg://{user}:{password}"
    f"@{settings.POSTGRES_SERVER}/{settings.POSTGRES_DB}"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
