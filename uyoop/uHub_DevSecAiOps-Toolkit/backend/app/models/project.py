from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from sqlalchemy import String, ForeignKey, Enum as SAEnum, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class ProjectStatus(str, Enum):
    active = "active"
    archived = "archived"
    paused = "paused"

class EnvironmentType(str, Enum):
    dev = "dev"
    test = "test"
    staging = "staging"
    prod = "prod"
    other = "other"

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    color: Mapped[str] = mapped_column(String, default="#000000")
    status: Mapped[ProjectStatus] = mapped_column(SAEnum(ProjectStatus), default=ProjectStatus.active)
    
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    # Relationships
    environments: Mapped[List["Environment"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    jobs: Mapped[List["Job"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    events: Mapped[List["Event"]] = relationship(back_populates="project", cascade="all, delete-orphan")

    # Execution Backend (v1: local/docker/webhook)
    execution_backend: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Simple string for now or Enum
    execution_backend_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )

class Environment(Base):
    __tablename__ = "environments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    type: Mapped[EnvironmentType] = mapped_column(SAEnum(EnvironmentType), default=EnvironmentType.other)
    
    project: Mapped["Project"] = relationship(back_populates="environments")
    jobs: Mapped[List["Job"]] = relationship(back_populates="environment")
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )

# Avoid circular imports by using string references for Job if needed, 
# but Job will likely import Project/Environment. 
# We forward reference Job in relationship above.
from sqlalchemy import DateTime
