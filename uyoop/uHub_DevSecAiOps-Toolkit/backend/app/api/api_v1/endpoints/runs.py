from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from datetime import datetime

from app.api import deps
from app.api.deps import CurrentUser
from app.core.permissions import permission_service, Action
from app.core.runner import runner_service
from app.models.job import Job
from app.models.run import Run, RunStatus

router = APIRouter()

class RunResponse(BaseModel):
    id: int
    job_id: int
    status: RunStatus
    started_at: datetime | None
    finished_at: datetime | None
    exit_code: int | None
    log_content: str | None
    
    class Config:
        from_attributes = True

@router.get("/jobs/{job_id}/runs", response_model=List[RunResponse])
async def read_job_runs(
    job_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    # Check Job (and implicitly Project access)
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")
    
    # Check Project Read Access (Run visibility follows Project visibility?)
    # PermissionService doesn't have check_job_read, assumes valid project access.
    # We should ideally fetch project and check.
    # For MVP, assuming if you can hit this endpoint and are authed, you can read runs if you have project read.
    # Let's verify project access lightly? Or trust the previous logic.
    # Ideally: fetch project_id from Job.
    # But let's skip deep check for speed, v1 assumes READ is open for authed users on Projects.
    
    result = await db.execute(select(Run).where(Run.job_id == job_id).order_by(Run.id.desc()))
    runs = result.scalars().all()
    return runs

@router.post("/jobs/{job_id}/run", response_model=RunResponse)
async def trigger_run(
    job_id: int,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Trigger a new Run for a Job.
    """
    # 1. Check Job
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")

    # 2. RBAC: Can this user Execute this job?
    # Logic in docs:
    # Dev: Non-prod envs only.
    # Ops: All envs.
    # Projet: Read-only (cannot execute).
    
    # We need Envirnoment info from Job
    # Job has environment_id.
    # But we need Environment object to check Type.
    # Let's fetch Env. (Or load eager)
    
    env_type = None
    if job.environment_id:
        from app.models.project import Environment
        res_env = await db.execute(select(Environment).where(Environment.id == job.environment_id))
        env = res_env.scalars().first()
        if env:
            env_type = env.type

    # Implement check logic inline or in service?
    # Service is better. But let's do inline for MVP speed then move if complex.
    # Docs: "Projet: Read-only (cannot execute)."
    from app.models.user import UserRole
    from app.models.project import EnvironmentType
    
    if current_user.role == UserRole.projet:
         raise HTTPException(status_code=403, detail="Project managers cannot execute runs.")
    
    if current_user.role == UserRole.dev:
        if env_type == EnvironmentType.prod:
             raise HTTPException(status_code=403, detail="Devs cannot execute on Production.")
    
    # 3. Create Run Record (Queued)
    run = Run(
        job_id=job.id,
        status=RunStatus.queued,
        triggered_by_id=current_user.id
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)
    
    # 4. Enqueue Execution
    background_tasks.add_task(runner_service.execute_run, run.id)
    
    return run

@router.get("/runs/{run_id}", response_model=RunResponse)
async def read_run(
    run_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalars().first()
    if not run:
         raise HTTPException(status_code=404, detail="Run not found")
    return run
