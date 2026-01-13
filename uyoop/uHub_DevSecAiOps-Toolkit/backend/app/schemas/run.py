from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.run import RunStatus

class RunBase(BaseModel):
    status: RunStatus = RunStatus.pending

class RunCreate(RunBase):
    job_id: int

class Run(RunBase):
    id: int
    job_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    exit_code: Optional[int] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None

    class Config:
        from_attributes = True
