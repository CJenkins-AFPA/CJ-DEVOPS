from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.event import EventType

class EventBase(BaseModel):
    title: str
    start: datetime
    end: Optional[datetime] = None
    event_type: EventType = EventType.job
    all_day: bool = False

class EventCreate(EventBase):
    project_id: int
    job_id: Optional[int] = None
    color: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    all_day: Optional[bool] = None
    color: Optional[str] = None

class Event(EventBase):
    id: int
    project_id: int
    job_id: Optional[int]
    color: Optional[str]
    conflict: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EventFullCalendar(BaseModel):
    """FullCalendar-compatible format"""
    id: int
    title: str
    start: datetime
    end: Optional[datetime]
    allDay: bool
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    extendedProps: dict
    
    class Config:
        from_attributes = True
