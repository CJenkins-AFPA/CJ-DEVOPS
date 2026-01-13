from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.api.deps import CurrentUser
from app.core.permissions import permission_service, Action
from app.models.job import Job, JobType
from app.models.project import Project, Environment
from app.schemas import job as job_schema
from app.services.calendar_service import calendar_service
from app.services.execution_service import execution_service
from app.schemas import run as run_schema
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/projects/{project_id}/jobs", response_model=List[job_schema.Job])
async def read_project_jobs(
    project_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve jobs for a project.
    """
    # Check Project existence
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")

    # Access check
    permission_service.check_project_access(current_user, project, Action.READ)
    
    result = await db.execute(
        select(Job)
        .where(Job.project_id == project_id)
        .offset(skip).limit(limit)
    )
    jobs = result.scalars().all()
    return jobs

@router.post("/projects/{project_id}/jobs", response_model=job_schema.Job)
async def create_project_job(
    project_id: int,
    job_in: job_schema.JobCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Create a job for a project.
    """
    # Check Project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
         
    # Check Environment details to enforce RBAC (Prod vs Non-Prod)
    env_type = None
    if job_in.environment_id:
        res_env = await db.execute(select(Environment).where(Environment.id == job_in.environment_id))
        env = res_env.scalars().first()
        if env:
            env_type = env.type
            if env.project_id != project_id:
                 raise HTTPException(status_code=400, detail="Environment belongs to another project")

    # RBAC Check: Create Job
    permission_service.check_job_create(current_user, job_in.job_type, env_type)
    
    job = Job(
        project_id=project_id,
        environment_id=job_in.environment_id,
        title=job_in.title,
        description=job_in.description,
        job_type=job_in.job_type,
        priority=job_in.priority,
        # status defaults to JobStatus.draft in Model
        owner_id=current_user.id,
        requested_by_id=current_user.id, # Assume creator is requester v1
        planned_start=job_in.planned_start,
        planned_end=job_in.planned_end,
        all_day=job_in.all_day,
        tags=job_in.tags,
        command=job_in.command,
        working_dir=job_in.working_dir
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Auto-sync with Calendar
    await calendar_service.sync_job_event(db, job)

    return job

@router.get("/jobs/{job_id}", response_model=job_schema.Job)
async def read_job(
    job_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get a specific job.
    """
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")
    
    # Access Check: Need to check project access
    result = await db.execute(select(Project).where(Project.id == job.project_id))
    project = result.scalars().first()
    
    # Implicitly if we found job, project must exist, but good to check access
    if project:
         permission_service.check_project_access(current_user, project, Action.READ)
         
    return job

@router.put("/jobs/{job_id}", response_model=job_schema.Job)
async def update_job(
    job_id: int,
    job_in: job_schema.JobUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Update a job.
    """
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")
    
    # Access Check
    result = await db.execute(select(Project).where(Project.id == job.project_id))
    project = result.scalars().first()
    if project:
        permission_service.check_project_access(current_user, project, Action.UPDATE)
    
    # Update fields
    update_data = job_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Auto-sync with Calendar
    await calendar_service.sync_job_event(db, job)

    return job

@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Delete a job.
    """
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")
    
    # Access Check
    result = await db.execute(select(Project).where(Project.id == job.project_id))
    project = result.scalars().first()
    if project:
        permission_service.check_project_access(current_user, project, Action.DELETE)
    
    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted successfully", "id": job_id}

@router.post("/jobs/{job_id}/run", response_model=run_schema.Run)
async def run_job_execution(
    job_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Trigger job execution (Local or SSH).
    """
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")

    # Access Check: Execute permission? For now READ/UPDATE implies Execute?
    # In v1, if you can edit, you can run.
    result = await db.execute(select(Project).where(Project.id == job.project_id))
    project = result.scalars().first()
    if project:
        permission_service.check_project_access(current_user, project, Action.UPDATE) # Require edit rights to run

    try:
        run = await execution_service.run_job(db, job_id)
        return run
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Failed to run job")
        raise HTTPException(status_code=500, detail="Execution failed")
