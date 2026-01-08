from datetime import datetime
from typing import Any, Dict, Optional, Literal, List

from pydantic import BaseModel


EventType = Literal["meeting", "deployment_window", "git_action"]
RoleType = Literal["PROJET", "DEV", "OPS", "ADMIN"]


class UserBase(BaseModel):
    username: str
    role: RoleType


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    totp_enabled: bool = False

    class Config:
        from_attributes = True


# ===== 2FA Schemas =====

class TOTPSetupResponse(BaseModel):
    """Réponse lors de la configuration 2FA"""
    qr_code_url: str
    secret: str
    backup_codes: Optional[List[str]] = None


class TOTPVerifyRequest(BaseModel):
    """Requête de vérification code TOTP"""
    user_id: int
    code: str


class TOTPStatusResponse(BaseModel):
    """Statut 2FA d'un utilisateur"""
    enabled: bool
    backup_codes_remaining: int = 0


class LoginRequest(BaseModel):
    """Requête de login avec support 2FA"""
    username: str
    password: str
    totp_code: Optional[str] = None


class LoginResponse(BaseModel):
    """Réponse login avec flag 2FA et tokens JWT"""
    user: User
    requires_totp: bool = False
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class TokenResponse(BaseModel):
    """Réponse pour refresh token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Requête de rafraîchissement de token"""
    refresh_token: str


class EventBase(BaseModel):
    title: str
    start: datetime
    end: Optional[datetime] = None
    type: EventType
    extra: Optional[Dict[str, Any]] = None
    created_by: Optional[int] = None


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: int

    class Config:
        from_attributes = True
