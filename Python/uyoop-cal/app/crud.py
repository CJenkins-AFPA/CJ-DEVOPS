from sqlalchemy.orm import Session
import bcrypt

from . import models, schemas


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash un mot de passe"""
    # Bcrypt a une limite de 72 bytes - on tronque en bytes
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


# Users

def get_users(db: Session):
    return db.query(models.User).all()

def get_user_by_id(db: Session, user_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str) -> models.User | None:
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    db_user = models.User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_role(db: Session, user_id: int, new_role: str) -> models.User | None:
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    db_user.role = new_role
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True


# Events

def get_events(db: Session):
    return db.query(models.Event).all()


def create_event(db: Session, event_in: schemas.EventCreate) -> models.Event:
    db_event = models.Event(
        title=event_in.title,
        start=event_in.start,
        end=event_in.end,
        type=event_in.type,
        extra=event_in.extra,
        created_by=event_in.created_by,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: int, event_in: schemas.EventCreate) -> models.Event | None:
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        return None
    db_event.title = event_in.title
    db_event.start = event_in.start
    db_event.end = event_in.end
    db_event.type = event_in.type
    db_event.extra = event_in.extra
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int) -> bool:
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        return False
    db.delete(db_event)
    db.commit()
    return True
