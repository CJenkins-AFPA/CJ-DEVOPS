import asyncio
import logging

from app.core.db import AsyncSessionLocal
from app.models.project import Project
from app.models.user import User
# Must import Job so SQLAlchemy registry knows about it for the relationship in Project
from app.models.job import Job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def ensure_project():
    async with AsyncSessionLocal() as session:
        # Check Project 1
        project = await session.get(Project, 1)
        if not project:
            logger.info("Project 1 missing. Creating 'uHub Platform'...")
            # Ensure owner exists
            user = await session.get(User, 1)
            owner_id = user.id if user else 1 # Fallback
            
            project = Project(
                id=1,
                name="uHub Platform",
                description="Centralized DevSecOps Tooling (Demo)",
                is_active=True,
                owner_id=owner_id
            )
            session.add(project)
            await session.commit()
            logger.info("Project 1 Created.")
        else:
            logger.info("Project 1 already exists.")

if __name__ == "__main__":
    asyncio.run(ensure_project())
