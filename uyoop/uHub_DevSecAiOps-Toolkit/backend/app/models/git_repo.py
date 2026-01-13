from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import String, ForeignKey, Enum as SAEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class GitProvider(str, Enum):
    github = "github"
    gitlab = "gitlab"
    gitea = "gitea"
    other = "other"

class GitRepo(Base):
    __tablename__ = "git_repos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    
    name: Mapped[str] = mapped_column(String)
    provider: Mapped[GitProvider] = mapped_column(SAEnum(GitProvider), default=GitProvider.other)
    url: Mapped[str] = mapped_column(String)
    default_branch: Mapped[str] = mapped_column(String, default="main")
    
    # Security: In v1, we might store a token reference or simply assume public/local for MVP
    # The doc mentions credentials_ref (Vault). We'll add it as optional string.
    credentials_ref: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", backref="repos") # backref strictly for simplicity here

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )

from sqlalchemy import DateTime
