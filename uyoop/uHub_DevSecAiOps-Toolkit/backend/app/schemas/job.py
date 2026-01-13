from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.job import JobType, JobStatus, JobPriority

class JobBase(BaseModel):
    title: str
    description: Optional[str] = None
    command: Optional[str] = None
    working_dir: Optional[str] = None
    job_type: JobType = JobType.dev
    priority: JobPriority = JobPriority.normal
    environment_id: Optional[int] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    all_day: bool = False
    tags: Optional[List[str]] = []

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    title: Optional[str] = None
    command: Optional[str] = None
    status: Optional[JobStatus] = None

class Job(JobBase):
    id: int
    project_id: int
    owner_id: int
    requested_by_id: Optional[int] = None
    status: JobStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
