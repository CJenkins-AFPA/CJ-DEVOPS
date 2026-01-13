import asyncio
import json
import logging
import os
from datetime import datetime, date, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.project import Project, Environment, ProjectStatus, EnvironmentType
from app.models.job import Job, JobType, JobStatus, JobPriority

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
JSON_USERS_PATH = "/docs/users.json"
JSON_PROJECTS_PATH = "/docs/projects-with-jobs.json"

async def get_user_id(session: AsyncSession, username: str) -> int:
    result = await session.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if user:
        return user.id
    return None

def parse_relative_time(planned_start_str: str) -> datetime:
    # Example: "+1d" -> Now + 1 day
    now = datetime.now(timezone.utc)
    if not planned_start_str or not planned_start_str.startswith("+"):
        return now
    
    try:
        suffix = planned_start_str[-1]
        val = int(planned_start_str[1:-1])
        if suffix == 'd':
            return now + timedelta(days=val)
        return now
    except:
        return now

async def seed_data():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        # 1. Seed Users
        if os.path.exists(JSON_USERS_PATH):
            logger.info(f"Loading users from {JSON_USERS_PATH}")
            with open(JSON_USERS_PATH, "r") as f:
                users_data = json.load(f)
                
            for user_dat in users_data:
                # Check exist
                res = await session.execute(select(User).where(User.username == user_dat["username"]))
                existing = res.scalars().first()
                if not existing:
                    logger.info(f"Creating user: {user_dat['username']}")
                    new_user = User(
                        username=user_dat["username"],
                        email=user_dat["email"],
                        hashed_password=get_password_hash(user_dat["password"]),
                        role=UserRole(user_dat["role"]), # Ensure lowercase in JSON matches Enum
                        display_name=user_dat.get("display_name"),
                        is_active=user_dat.get("is_active", True)
                    )
                    session.add(new_user)
            await session.commit()
        
        # 2. Seed Projects & Jobs
        if os.path.exists(JSON_PROJECTS_PATH):
            logger.info(f"Loading projects from {JSON_PROJECTS_PATH}")
            with open(JSON_PROJECTS_PATH, "r") as f:
                projects_data = json.load(f)
            
            for proj_dat in projects_data:
                res = await session.execute(select(Project).where(Project.name == proj_dat["name"]))
                existing_proj = res.scalars().first()
                
                owner_id = await get_user_id(session, proj_dat.get("owner_username"))
                if not owner_id:
                    logger.warning(f"Owner {proj_dat.get('owner_username')} not found for project {proj_dat['name']}, defaulting to admin.")
                    owner_id = await get_user_id(session, "demo-admin")

                if not existing_proj:
                    logger.info(f"Creating project: {proj_dat['name']}")
                    new_proj = Project(
                        name=proj_dat["name"],
                        color=proj_dat.get("color"),
                        owner_id=owner_id,
                        status=ProjectStatus.active
                    )
                    session.add(new_proj)
                    await session.commit()
                    await session.refresh(new_proj)
                    
                    # Create Environments
                    env_map = {} # Name -> ID
                    env_names = proj_dat.get("environments", ["dev", "staging", "prod"])
                    for env_name in env_names:
                        # Simple mapping: dev->dev, staging->staging, prod->prod
                        try:
                            etype = EnvironmentType(env_name)
                        except:
                            etype = EnvironmentType.other
                        
                        logger.info(f"  - Adding env: {env_name}")
                        new_env = Environment(
                            project_id=new_proj.id,
                            name=env_name,
                            type=etype
                        )
                        session.add(new_env)
                        await session.commit()
                        await session.refresh(new_env)
                        env_map[env_name] = new_env.id
                    
                    # Create Jobs
                    jobs_list = proj_dat.get("jobs", [])
                    for job_dat in jobs_list:
                        logger.info(f"  - Adding job: {job_dat['title']}")
                        
                        env_id = None
                        if "environment" in job_dat and job_dat["environment"] in env_map:
                            env_id = env_map[job_dat["environment"]]
                        
                        # Determine owner (default project owner)
                        job_owner_id = owner_id
                        
                        start_time = parse_relative_time(job_dat.get("planned_start"))
                        
                        new_job = Job(
                            project_id=new_proj.id,
                            environment_id=env_id,
                            title=job_dat["title"],
                            job_type=JobType(job_dat["job_type"]),
                            status=JobStatus.planned,
                            owner_id=job_owner_id,
                            planned_start=start_time,
                            all_day=job_dat.get("all_day", False)
                        )
                        session.add(new_job)
                    await session.commit()

        logger.info("Seeding (v2) complete.")

if __name__ == "__main__":
    asyncio.run(seed_data())
