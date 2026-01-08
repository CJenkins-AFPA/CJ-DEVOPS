import pytest
import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import sqlalchemy.dialects.postgresql

# --- Mock JSONB for SQLite ---
# Patch JSONB to work as generic JSON on SQLite
from sqlalchemy.types import JSON
sqlalchemy.dialects.postgresql.JSONB = JSON

# Ajouter le dossier parent au path pour importer app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app, get_db  # noqa: E402
from app.database import Base  # noqa: E402
from app import models, auth  # noqa: E402
from app.auth import get_db as auth_get_db  # noqa: E402

# --- Database Fixtures ---

# Utiliser une base SQLite en mémoire pour les tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Crée une nouvelle base de données pour chaque test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Client FastAPI utilisant la DB de test."""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[auth_get_db] = override_get_db # Override pour auth.py
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# --- Auth Helpers ---

@pytest.fixture
def auth_tokens(db_session, client):
    """
    Crée les utilisateurs de test et retourne un dictionnaire de tokens pour chaque rôle.
    Utilise auth.create_access_token directement pour éviter de passer par /login 
    (plus rapide et évite dépendance sur endpoint login).
    """
    # 1. Créer les users
    users_data = [
        {"username": "admin_test", "role": "ADMIN", "id": 1},
        {"username": "dev_test", "role": "DEV", "id": 2},
        {"username": "ops_test", "role": "OPS", "id": 3},
        {"username": "projet_test", "role": "PROJET", "id": 4},
    ]
    
    tokens = {}
    
    for u in users_data:
        # Créer user en DB
        db_user = models.User(
            id=u["id"],
            username=u["username"],
            role=u["role"],
            password_hash="fakehash", # Pas besoin de vrai hash si on fake le token
            totp_enabled=False
        )
        db_session.add(db_user)
        db_session.commit()
        
        # Générer token valide
        token = auth.create_access_token(data={"sub": str(u["id"])})
        tokens[u["role"]] = token
        
    return tokens

