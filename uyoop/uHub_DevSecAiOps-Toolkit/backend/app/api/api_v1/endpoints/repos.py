from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.api import deps
from app.api.deps import CurrentUser
from app.core.permissions import permission_service, Action
from app.models.project import Project
from app.models.git_repo import GitRepo, GitProvider

router = APIRouter()

# Schema for input (keep it simple/inline or move to schemas/ later if big)
class RepoCreate(BaseModel):
    name: str
    url: str
    provider: GitProvider = GitProvider.other
    default_branch: str = "main"

class RepoResponse(BaseModel):
    id: int
    name: str
    url: str
    provider: GitProvider
    
    class Config:
        from_attributes = True

@router.get("/projects/{project_id}/repos", response_model=List[RepoResponse])
async def read_project_repos(
    project_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    # Check Project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")

    permission_service.check_project_access(current_user, project, Action.READ)
    
    result = await db.execute(select(GitRepo).where(GitRepo.project_id == project_id))
    repos = result.scalars().all()
    return repos

@router.post("/projects/{project_id}/repos", response_model=RepoResponse)
async def create_project_repo(
    project_id: int,
    repo_in: RepoCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    # Check Project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
         
    # Only Admin or Owner can manage infra/repos? 
    # Doc says: "Projets: Déclarer les repos Git".
    # check_project_access allows UPDATE/MANAGE for Owner/Admin.
    permission_service.check_project_access(current_user, project, Action.UPDATE)
    
    repo = GitRepo(
        project_id=project_id,
        name=repo_in.name,
        url=repo_in.url,
        provider=repo_in.provider,
        default_branch=repo_in.default_branch
    )
    db.add(repo)
    await db.commit()
    await db.refresh(repo)
    return repo
