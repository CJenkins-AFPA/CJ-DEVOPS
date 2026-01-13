from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import String, ForeignKey, Enum as SAEnum, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class EventType(str, Enum):
    job = "job"
    meeting = "meeting"
    maintenance = "maintenance"
    incident = "incident"
    other = "other"

class Event(Base):
    __tablename__ = "events"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    job_id: Mapped[Optional[int]] = mapped_column(ForeignKey("jobs.id"), nullable=True, index=True)
    # incident_id: Mapped[Optional[int]] = mapped_column(ForeignKey("incidents.id"), nullable=True, index=True)  # For later
    
    title: Mapped[str] = mapped_column(String)
    start: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    
    event_type: Mapped[EventType] = mapped_column(SAEnum(EventType), default=EventType.job)
    color: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    all_day: Mapped[bool] = mapped_column(default=False)
    
    # Conflict flag (computed)
    conflict: Mapped[bool] = mapped_column(default=False)
    
    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="events")
    job: Mapped[Optional["Job"]] = relationship("Job", back_populates="events")
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
