from typing import List
from pathlib import Path
import subprocess
import shlex
import io
import base64

from fastapi import FastAPI, Depends, HTTPException, Body, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import qrcode
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models, schemas, crud
from .database import Base, engine, SessionLocal
from .vault_client import vault_client
from . import auth as auth_module



# Création des tables au démarrage (MVP)
Base.metadata.create_all(bind=engine)

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="DevOps Calendar API",
    description="""
🗓️ **API de gestion de calendrier DevOps** avec authentification par rôles et sécurité renforcée.

## Fonctionnalités

* **Gestion des événements** : Créer, lire, modifier et supprimer des événements (réunions, fenêtres de déploiement, actions Git)
* **Gestion des utilisateurs** : Système de rôles (viewer, editor, admin) avec contrôle d'accès
* **Actions Git** : Exécution automatique de clone/pull sur des dépôts Git
* **Interface web** : Application FullCalendar avec vues Tableau, Dashboard et Membres
* **Sécurité** : 2FA TOTP, rate limiting, secrets vault, audit logs

## Authentification

Utilisez le header `Authorization: Bearer <token>` avec un JWT obtenu via `/login`.
Les endpoints sensibles sont protégés par rate limiting.
    """,
    version="0.1.0",
    contact={
        "name": "DevOps Calendar Team",
        "url": "https://github.com/your-org/devops-calendar",
    },
    openapi_tags=[
        {
            "name": "auth",
            "description": "Authentification et gestion de session"
        },
        {
            "name": "events",
            "description": "Opérations CRUD sur les événements du calendrier"
        },
        {
            "name": "users",
            "description": "Gestion des utilisateurs et des rôles (admin uniquement)"
        },
        {
            "name": "git",
            "description": "Exécution d'actions Git (clone/pull)"
        }
    ]
)
 


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # HSTS (only effective over HTTPS, harmless otherwise)
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    # Content Security Policy - Scripts et styles externalisés, autoriser CDN
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' data:; "
        "style-src 'self' https://cdn.jsdelivr.net; "
        "script-src 'self' https://cdn.jsdelivr.net; "
        "connect-src 'self'; frame-ancestors 'none'"
    )
    # Clickjacking protection
    response.headers["X-Frame-Options"] = "DENY"
    # MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Referrer policy
    response.headers["Referrer-Policy"] = "no-referrer"
    # Permissions policy
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

BASE_DIR = Path(__file__).resolve().parent
static_dir = BASE_DIR / "static"
repos_dir = BASE_DIR / "repos"
repos_dir.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def read_root():
    """Retourne l'application web FullCalendar"""
    index_file = static_dir / "index.html"
    return index_file.read_text(encoding="utf-8")


@app.get("/health", tags=["monitoring"])
def health_check():
    """
    Health check endpoint for container orchestration (Docker, K8s).
    Returns 200 OK if application is running.
    """
    return {
        "status": "healthy",
        "service": "uyoop-cal-api",
        "version": "0.1.0"
    }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Legacy get_current_user supprimé - Utiliser auth_module.get_current_user (JWT uniquement)


def get_current_user_secure(
    current_user: models.User = Depends(auth_module.get_current_user),
):
    """
    Récupère l'utilisateur courant via JWT uniquement.
    Authentification obligatoire par token Bearer.
    """
    return current_user


# Users

@app.get("/users", response_model=List[schemas.User], tags=["users"])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_secure)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can list users")
    return crud.get_users(db)


@app.post("/users", response_model=schemas.User, tags=["users"])
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user_in)


@app.put("/users/{user_id}", response_model=schemas.User, tags=["users"])
def update_user(
    user_id: int,
    payload: schemas.UserCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_secure),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can update users")

    updated = crud.update_user_role(db, user_id, payload.role)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@app.delete("/users/{user_id}", status_code=204, tags=["users"])
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_secure),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can delete users")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "deleted", "user_id": user_id}


@app.post("/login", response_model=schemas.LoginResponse, tags=["auth"])
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: schemas.LoginRequest = Body(...),
    db: Session = Depends(get_db),
):
    """
    Connexion avec support 2FA (rate limited: 5 tentatives/minute)
    - Vérifie le mot de passe, puis 2FA si activé
    - Ne crée plus de compte lors du login (création réservée aux admins)
    """
    existing = crud.get_user_by_username(db, payload.username)

    if not existing:
        # Ne pas révéler si l'utilisateur existe
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # Vérifier le mot de passe
    if not crud.verify_password(payload.password, existing.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # Si 2FA activé, vérifier le code
    if existing.totp_enabled:
        if not payload.totp_code:
            # Pas de code fourni, demander le code
            return schemas.LoginResponse(user=existing, requires_totp=True)

        # Valider le code TOTP
        if not vault_client.totp_validate_code(f"user_{existing.id}", payload.totp_code):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")

    # Authentification réussie : générer tokens JWT
    access_token = auth_module.create_access_token(data={"sub": str(existing.id)})
    refresh_token = auth_module.create_refresh_token(data={"sub": str(existing.id)})
    
    return schemas.LoginResponse(
        user=existing,
        requires_totp=False,
        access_token=access_token,
        refresh_token=refresh_token
    )


@app.post("/token/refresh", response_model=schemas.TokenResponse, tags=["auth"])
@limiter.limit("10/minute")
def refresh_token(
    request: Request,
    payload: schemas.RefreshTokenRequest = Body(...),
    db: Session = Depends(get_db),
):
    """
    Rafraîchit les tokens JWT (rate limited: 10/minute)
    Utilise un refresh_token pour obtenir de nouveaux access/refresh tokens
    """
    # Valider le refresh token
    token_payload = auth_module.verify_token(payload.refresh_token, token_type="refresh")
    user_id = token_payload.get("sub")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Vérifier que l'utilisateur existe toujours
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Générer nouveaux tokens
    new_access_token = auth_module.create_access_token(data={"sub": str(user.id)})
    new_refresh_token = auth_module.create_refresh_token(data={"sub": str(user.id)})
    
    return schemas.TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )

# ===== 2FA Endpoints =====
# ===== 2FA Endpoints =====

@app.post("/2fa/setup", response_model=schemas.TOTPSetupResponse, tags=["auth"])
@limiter.limit("3/minute")
def setup_2fa(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Configure 2FA pour un utilisateur (rate limited: 3/minute)
    Retourne le QR code et le secret pour l'authenticator app
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.totp_enabled:
        raise HTTPException(status_code=400, detail="2FA already enabled")
    
    # Créer clé TOTP dans Vault avec generate=True
    key_name = f"user_{user_id}"
    issuer = "uyoop-cal"
    account_name = user.username
    
    totp_data = vault_client.totp_create_key(key_name, issuer, account_name)
    if not totp_data:
        raise HTTPException(status_code=500, detail="Failed to create TOTP key")
    
    # Récupérer l'URL pour le QR code
    totp_url = totp_data['url']
    
    # Générer QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Générer backup codes
    import secrets
    backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
    
    # Stocker backup codes hashés dans Vault
    hashed_codes = [crud.get_password_hash(code) for code in backup_codes]
    vault_client.write_secret(
        f"backup_codes/{key_name}",
        {"codes": hashed_codes, "used": []}
    )
    
    return schemas.TOTPSetupResponse(
        qr_code_url=f"data:image/png;base64,{qr_base64}",
        secret="HIDDEN",  # Ne pas exposer le secret
        backup_codes=backup_codes
    )


@app.post("/2fa/enable", tags=["auth"])
@limiter.limit("10/minute")
def enable_2fa(
    request: Request,
    payload: schemas.TOTPVerifyRequest,
    db: Session = Depends(get_db),
):
    """
    Active 2FA après vérification (rate limited: 10/minute)
    """
    user = crud.get_user_by_id(db, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.totp_enabled:
        raise HTTPException(status_code=400, detail="2FA already enabled")
    
    # Valider le code TOTP réel avec Vault
    key_name = f"user_{payload.user_id}"
    if not vault_client.totp_validate_code(key_name, payload.code):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    
    # Activer 2FA
    user.totp_enabled = True
    db.commit()
    db.refresh(user)
    
    return {"status": "enabled", "message": "2FA successfully activated"}


@app.post("/2fa/verify", tags=["auth"])
@limiter.limit("10/minute")
def verify_2fa(
    request: Request,
    payload: schemas.TOTPVerifyRequest,
):
    """
    Vérifie un code 2FA (rate limited: 10/minute)
    """
    key_name = f"user_{payload.user_id}"
    
    # Vérifier si c'est un backup code
    backup_data = vault_client.read_secret(f"backup_codes/{key_name}")
    if backup_data:
        for idx, hashed_code in enumerate(backup_data.get("codes", [])):
            if crud.verify_password(payload.code, hashed_code):
                # Marquer comme utilisé
                used = backup_data.get("used", [])
                if idx not in used:
                    used.append(idx)
                    vault_client.write_secret(
                        f"backup_codes/{key_name}",
                        {**backup_data, "used": used}
                    )
                    return {"valid": True, "type": "backup_code"}
                else:
                    raise HTTPException(status_code=401, detail="Backup code already used")
    
    # Sinon, valider TOTP
    is_valid = vault_client.totp_validate_code(key_name, payload.code)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    
    return {"valid": True, "type": "totp"}


@app.delete("/2fa/disable", tags=["auth"])
@limiter.limit("3/minute")
def disable_2fa(
    request: Request,
    user_id: int,
    code: str,
    db: Session = Depends(get_db),
):
    """
    Désactive 2FA (rate limited: 3/minute)
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.totp_enabled:
        raise HTTPException(status_code=400, detail="2FA not enabled")
    
    # Valider code avant désactivation
    key_name = f"user_{user_id}"
    if not vault_client.totp_validate_code(key_name, code):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    
    # Désactiver et nettoyer
    user.totp_enabled = False
    db.commit()
    
    # Supprimer clé TOTP et backup codes de Vault
    vault_client.totp_delete_key(key_name)
    vault_client.delete_secret(f"backup_codes/{key_name}")
    
    return {"status": "disabled"}


@app.get("/2fa/status/{user_id}", response_model=schemas.TOTPStatusResponse, tags=["auth"])
def get_2fa_status(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Récupère le statut 2FA d'un utilisateur
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    backup_codes_remaining = 0
    if user.totp_enabled:
        key_name = f"user_{user_id}"
        backup_data = vault_client.read_secret(f"backup_codes/{key_name}")
        if backup_data:
            total_codes = len(backup_data.get("codes", []))
            used_codes = len(backup_data.get("used", []))
            backup_codes_remaining = total_codes - used_codes
    
    return schemas.TOTPStatusResponse(
        enabled=user.totp_enabled,
        backup_codes_remaining=backup_codes_remaining
    )


# Events

@app.get("/events", response_model=List[schemas.Event], tags=["events"])
def read_events(db: Session = Depends(get_db)):
    events = crud.get_events(db)
    return events


@app.post("/events", response_model=schemas.Event, tags=["events"])
def create_event(
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_secure),
):
    # RBAC par rôle métier
    role = current_user.role
    event_type = event_in.type
    
    # ADMIN peut tout créer
    if role == "ADMIN":
        pass
    # PROJET peut créer tous types d'événements
    elif role == "PROJET":
        pass
    # DEV peut créer uniquement git_action
    elif role == "DEV":
        if event_type != "git_action":
            raise HTTPException(status_code=403, detail="DEV role can only create git_action events")
    # OPS peut créer uniquement deployment_window
    elif role == "OPS":
        if event_type != "deployment_window":
            raise HTTPException(status_code=403, detail="OPS role can only create deployment_window events")
    else:
        raise HTTPException(status_code=403, detail="Invalid role")

    if event_in.created_by is None:
        event_in.created_by = current_user.id

    event = crud.create_event(db, event_in)
    return event


@app.put("/events/{event_id}", response_model=schemas.Event, tags=["events"])
def update_event(
    event_id: int,
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_secure),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Only creator or admin can update
    if event.created_by != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only creator or admin can update this event")

    updated = crud.update_event(db, event_id, event_in)
    return updated


@app.delete("/events/{event_id}", status_code=204, tags=["events"])
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_secure),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Only creator or admin can delete
    if event.created_by != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only creator or admin can delete this event")

    crud.delete_event(db, event_id)
    return {"status": "deleted", "event_id": event_id}


# Git actions (clone/pull)

def _run(cmd: str, cwd: Path | None = None) -> tuple[int, str, str]:
    proc = subprocess.Popen(
        shlex.split(cmd),
        cwd=str(cwd) if cwd else None,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    out, err = proc.communicate(timeout=120)
    return proc.returncode, out, err


@app.post("/git/run/{event_id}", tags=["git"])
def run_git_action(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_secure),
):
    if current_user.role not in ["ADMIN", "DEV"]:
        raise HTTPException(status_code=403, detail="Only admins and DEV can run git actions")

    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.type != "git_action":
        raise HTTPException(status_code=400, detail="Event is not a git_action")

    details = event.extra or {}
    repo_url: str | None = details.get("repo_url")
    branch: str | None = details.get("branch", "main")
    action: str | None = details.get("action", "clone_or_pull")

    if not repo_url:
        raise HTTPException(status_code=400, detail="Missing repo_url in event.extra")

    repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
    target_dir = repos_dir / repo_name

    logs: list[dict] = []
    try:
        if action == "clone" or (action == "clone_or_pull" and not target_dir.exists()):
            code, out, err = _run(f"git clone {shlex.quote(repo_url)} {shlex.quote(str(target_dir))}")
            logs.append({"cmd": "git clone", "code": code, "out": out, "err": err})
            if code != 0:
                raise HTTPException(status_code=500, detail=f"git clone failed: {err}")

        if not target_dir.exists():
            raise HTTPException(status_code=404, detail="Repository directory not found after clone")

        if action in ("pull", "clone_or_pull", "checkout_pull"):
            if branch:
                code, out, err = _run(f"git checkout {shlex.quote(branch)}", cwd=target_dir)
                logs.append({"cmd": f"git checkout {branch}", "code": code, "out": out, "err": err})
                if code != 0:
                    raise HTTPException(status_code=500, detail=f"git checkout failed: {err}")
            code, out, err = _run("git pull --ff-only", cwd=target_dir)
            logs.append({"cmd": "git pull", "code": code, "out": out, "err": err})
            if code != 0:
                raise HTTPException(status_code=500, detail=f"git pull failed: {err}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Git action error: {e}")

    return {
        "status": "ok",
        "event_id": event.id,
        "repo": repo_name,
        "branch": branch,
        "action": action,
        "logs": logs,
        "path": str(target_dir),
    }
