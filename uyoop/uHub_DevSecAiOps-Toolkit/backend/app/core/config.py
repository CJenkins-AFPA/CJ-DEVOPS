from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "uHub"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str # Required (Env: SECRET_KEY)
    ALGORITHM: str = "HS256"
    
    # Database
    POSTGRES_SERVER: str = "postgres"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str | None = None # If None, fetch from Vault
    POSTGRES_DB: str = "uhub"
    
    VAULT_ADDR: str = "http://vault:8200"
    VAULT_TOKEN: str | None = None # Required for hvac

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
    
    class Config:
        case_sensitive = True

settings = Settings()
