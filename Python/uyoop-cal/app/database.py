import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DEFAULT_DB_URL = "postgresql://devops_calendar:devops_calendar@localhost:5432/devops_calendar"


def resolve_database_url() -> str:
    # 1) Environment variable wins (useful for local/dev overrides)
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        print(f"✅ DATABASE_URL from env: {env_url}")
        return env_url

    # 2) Try Vault KV (path: secret/data/app/config with key: database_url)
    try:
        from .vault_client import vault_client

        if vault_client and vault_client.is_authenticated():
            data = vault_client.read_secret("app/config")
            if data and isinstance(data, dict):
                url = data.get("database_url")
                if url:
                    print(f"✅ DATABASE_URL from Vault: {url}")
                    return url
    except Exception as e:
        # Silent fallback to default if Vault is unreachable/misconfigured
        print(f"⚠️  Vault error: {e}")
        pass

    # 3) Final fallback: hardcoded local default
    print(f"⚠️  Using fallback DATABASE_URL: {DEFAULT_DB_URL}")
    return DEFAULT_DB_URL


DATABASE_URL = resolve_database_url()

engine = create_engine(DATABASE_URL, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()
