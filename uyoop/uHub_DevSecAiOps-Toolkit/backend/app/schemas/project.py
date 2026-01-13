from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.project import ProjectStatus, EnvironmentType

# --- Environment Schemas ---
class EnvironmentBase(BaseModel):
    name: str
    type: EnvironmentType = EnvironmentType.other
    description: Optional[str] = None

class EnvironmentCreate(EnvironmentBase):
    pass

class EnvironmentUpdate(EnvironmentBase):
    name: Optional[str] = None
    type: Optional[EnvironmentType] = None

class Environment(EnvironmentBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#000000"
    status: ProjectStatus = ProjectStatus.active
    execution_backend: Optional[str] = None
    execution_backend_config: Optional[Dict[str, Any]] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    status: Optional[ProjectStatus] = None

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    environments: List[Environment] = []

    class Config:
        from_attributes = True
