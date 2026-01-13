import asyncio
import logging

from app.core.db import AsyncSessionLocal
from app.models.job import Job, JobType, JobStatus, JobPriority
from app.models.project import Project
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_mock_jobs():
    async with AsyncSessionLocal() as session:
        # Find Project 1
        project = await session.get(Project, 1)
        if not project:
            logger.error("Project 1 not found. Run basic seed first.")
            return

        # Find a User (Admin)
        user = await session.get(User, 1)
        if not user:
            logger.error("User 1 not found.")
            return

        jobs_data = [
            {
                "title": "Deploy Nginx (Mock Ansible)",
                "description": "Simulates an Ansible playbook run to install Nginx.",
                "command": "mock:ansible",
                "job_type": JobType.ops,
                "priority": JobPriority.high
            },
            {
                "title": "Provision AWS (Mock Terraform)",
                "description": "Simulates Terraform plan/apply for EC2 instance.",
                "command": "mock:terraform",
                "job_type": JobType.infra,
                "priority": JobPriority.normal
            },
             {
                "title": "Check System Info (Real Shell)",
                "description": "Runs 'uname -a' on the runner container.",
                "command": "uname -a",
                "job_type": JobType.maintenance,
                "priority": JobPriority.low
            }
        ]

        for j in jobs_data:
            job = Job(
                project_id=project.id,
                title=j["title"],
                description=j["description"],
                command=j["command"],
                job_type=j["job_type"],
                priority=j["priority"],
                status=JobStatus.draft,
                owner_id=user.id,
                requested_by_id=user.id,
                all_day=False
            )
            session.add(job)
        
        await session.commit()
        logger.info("Mock Jobs Seeded Successfully!")

if __name__ == "__main__":
    asyncio.run(seed_mock_jobs())
