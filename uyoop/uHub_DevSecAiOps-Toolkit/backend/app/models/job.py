from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from sqlalchemy import String, ForeignKey, Enum as SAEnum, DateTime, ARRAY, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class JobType(str, Enum):
    dev = "dev"
    ops = "ops"
    maintenance = "maintenance"
    meeting = "meeting"
    infra = "infra"

class JobCommandType(str, Enum):
    shell = "shell"
    ssh = "ssh"

class JobStatus(str, Enum):
    draft = "draft"
    planned = "planned"
    running = "running"
    success = "success"
    failed = "failed"
    canceled = "canceled"

class JobPriority(str, Enum):
    low = "low"
    normal = "normal"
    high = "high"
    critical = "critical"

class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    environment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("environments.id"), nullable=True)
    
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    command: Mapped[str] = mapped_column(String, default="") # The script/playbook/command to run
    working_dir: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Optional override
    
    command_type: Mapped[JobCommandType] = mapped_column(SAEnum(JobCommandType), default=JobCommandType.shell)
    target_host: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    target_user: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    credential_key: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    job_type: Mapped[JobType] = mapped_column(SAEnum(JobType), default=JobType.dev)
    status: Mapped[JobStatus] = mapped_column(SAEnum(JobStatus), default=JobStatus.draft)
    priority: Mapped[JobPriority] = mapped_column(SAEnum(JobPriority), default=JobPriority.normal)
    
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    requested_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    
    planned_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    planned_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    tags: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True) # Using JSON for list[str]

    all_day: Mapped[bool] = mapped_column(default=False)
    
    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="jobs")
    environment: Mapped[Optional["Environment"]] = relationship("Environment", back_populates="jobs")
    events: Mapped[List["Event"]] = relationship("Event", back_populates="job", cascade="all, delete-orphan")
    runs: Mapped[List["Run"]] = relationship("Run", back_populates="job", cascade="all, delete-orphan")
    # owner: Mapped["User"] = relationship("User") # Optional circular, assume ID is enough for now

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )
