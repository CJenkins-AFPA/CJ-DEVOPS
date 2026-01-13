from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.api.deps import CurrentUser
from app.core.permissions import permission_service, Action
from app.models.project import Project, Environment, ProjectStatus, EnvironmentType
from app.schemas import project as project_schema

router = APIRouter()

@router.get("/", response_model=List[project_schema.Project])
async def read_projects(
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve projects.
    """
    # Permission check for reading list (Open to all authed v1)
    permission_service.check_project_access(current_user, None, Action.READ)
    
    # Select projects with eager loading
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.environments))
        .offset(skip).limit(limit)
    )
    projects = result.scalars().all()
    return projects

@router.post("/", response_model=project_schema.Project)
async def create_project(
    *,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
    project_in: project_schema.ProjectCreate,
) -> Any:
    """
    Create new project.
    """
    # RBAC: Create Check
    permission_service.check_project_access(current_user, None, Action.CREATE)
    
    project = Project(
        name=project_in.name,
        description=project_in.description,
        color=project_in.color,
        status=project_in.status,
        execution_backend=project_in.execution_backend,
        execution_backend_config=project_in.execution_backend_config,
        owner_id=current_user.id
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Create default environments? (Optional v1 requirement: "4 projets types... avec envs dev/staging/prod")
    # Let's create default envs automatically for convenience
    default_envs = [EnvironmentType.dev, EnvironmentType.staging, EnvironmentType.prod]
    for env_type in default_envs:
        env = Environment(
            project_id=project.id, 
            name=env_type.value, 
            type=env_type,
            description=f"Default {env_type.value} environment"
        )
        db.add(env)
    
    await db.commit()
    await db.refresh(project) # Refresh to get environments
    
    # We need to explicitly reload environments relationship for Pydantic
    result = await db.execute(
        select(Project).options(selectinload(Project.environments)).where(Project.id == project.id)
    )
    project = result.scalars().first()
    
    return project

@router.get("/{project_id}", response_model=project_schema.Project)
async def read_project(
    project_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get project by ID.
    """
    result = await db.execute(
        select(Project).options(selectinload(Project.environments)).where(Project.id == project_id)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    permission_service.check_project_access(current_user, project, Action.READ)
    return project

@router.put("/{project_id}", response_model=project_schema.Project)
async def update_project(
    project_id: int,
    project_in: project_schema.ProjectUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Update a project.
    """
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    permission_service.check_project_access(current_user, project, Action.UPDATE)
    
    update_data = project_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
        
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project
