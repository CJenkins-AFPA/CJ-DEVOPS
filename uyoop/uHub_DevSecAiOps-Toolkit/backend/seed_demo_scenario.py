
import asyncio
import logging
from datetime import datetime, timedelta, timezone
import random

from sqlalchemy import select, delete, text
from app.core.db import AsyncSessionLocal
from app.models.project import Project
from app.models.job import Job
from app.models.event import Event, EventType
from app.models.user import User
from app.services.calendar_service import calendar_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_demo_data():
    async with AsyncSessionLocal() as db:
        logger.info("🧹 Cleaning up existing operational data...")
        # TRUNCATE tables with CASCADE to handle foreign keys
        await db.execute(text("TRUNCATE TABLE events RESTART IDENTITY CASCADE"))
        await db.execute(text("TRUNCATE TABLE jobs RESTART IDENTITY CASCADE"))
        # We define Projects, but let's assume standard projects exist or we create them.
        # Check if we have projects, if not create them.
        result = await db.execute(select(Project))
        projects = result.scalars().all()
        
        # Fetch a user for owner_id
        result = await db.execute(select(User))
        user = result.scalars().first()
        if not user:
             logger.error("No user found! Run seed_db first.")
             return
        owner_id = user.id
        
        project_map = {p.id: p for p in projects}
        
        # Ensure we have at least 2 projects for the scenario
        # If not enough projects, create dummy ones?
        # Assuming the standard seed_db has run and we have projects.
        # Let's verify we have at least Project 1 (Prod) and Project 2 (Staging) or similiar.
        
        if not projects:
            logger.error("No projects found! Run initial seed first.")
            return

        # Pick Project IDs (assuming 1 and 2 exist, or pick first two)
        p_prod = projects[0]
        p_stage = projects[1] if len(projects) > 1 else projects[0]
        
        logger.info(f"🎭 Setting up scenario on Project '{p_prod.name}' (Prod) and '{p_stage.name}' (Staging)...")

        # --- Base Time Reference ---
        # We want the demo to look "Next Week" or "Current Week" relative to now.
        # Let's pick next Friday for the big conflict if today is not Friday, or Tomorrow.
        # Actually, let's fix it to "Tomorrow" and "Day After Tomorrow" to be immediate.
        
        now = datetime.now(timezone.utc)
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Scenario 1: The "Production Crisis" (Conflict)
        # Situation: Major Release vs DB Maintenance
        # Date: Tomorrow Night
        
        tomorrow_night = today + timedelta(days=1, hours=20) # 20:00
        
        # Job 1: Major Release
        job_release = Job(
            title="🚀 Major Release v2.0",
            project_id=p_prod.id,
            status="planned", # Was pending (invalid)
            owner_id=owner_id,
            command="deploy.sh",
            planned_start=tomorrow_night,
            planned_end=tomorrow_night + timedelta(hours=4), # 4 hours duration
            tags=["deploy", "production", "critical"]
        )
        db.add(job_release)
        
        # Job 2: DB Maintenance (Conflict!)
        # Overlaps in the middle
        job_maintenance = Job(
            title="🔧 DB Vacuum & Reindex",
            project_id=p_prod.id,
            status="planned",
            owner_id=owner_id,
            command="vacuum_db",
            planned_start=tomorrow_night + timedelta(hours=1), # 21:00
            planned_end=tomorrow_night + timedelta(hours=2), # 22:00 (1h duration)
            tags=["maintenance", "database", "automated"]
        )
        db.add(job_maintenance)
        
        # Scenario 2: The "Staging Bottleneck" (Conflict)
        # Situation: Load Test vs Security Scan
        # Date: Day after tomorrow
        
        day_after = today + timedelta(days=2, hours=10) # 10:00
        
        # Job 3: Load Testing
        job_load = Job(
            title="🏋️ Load Testing (Peak Traffic)",
            project_id=p_stage.id,
            status="planned",
            owner_id=owner_id,
            command="k6 run script.js",
            planned_start=day_after,
            planned_end=day_after + timedelta(hours=8), # 18:00
            tags=["qa", "load-test", "staging"]
        )
        db.add(job_load)
        
        # Job 4: Security Scan (Conflict!)
        job_scan = Job(
            title="🛡️ Automated Security Scan",
            project_id=p_stage.id,
            status="planned",
            owner_id=owner_id,
            command="trivy scan",
            planned_start=day_after + timedelta(hours=4), # 14:00
            planned_end=day_after + timedelta(hours=5), # 15:00
            tags=["security", "scan", "compliance"]
        )
        db.add(job_scan)
        
        # Scenario 3: Some "Safe" events to populate the calendar
        # Weekly Reports (Recurring-like)
        for i in range(5): # Next 5 days
            d = today + timedelta(days=i, hours=9)
            job_report = Job(
                title=f"Daily Standup",
                project_id=p_stage.id,
                status="success" if i == 0 else "planned",
                owner_id=owner_id,
                command="echo 'meeting'",
                planned_start=d,
                planned_end=d + timedelta(minutes=15),
                tags=["meeting"]
            )
            db.add(job_report)

        await db.commit()
        
        # Sync to Calendar
        # We need to refresh jobs to get IDs
        # Then create events
        
        logger.info("🔄 Syncing Jobs to Calendar...")
        
        # Fetch all new jobs
        result = await db.execute(select(Job))
        jobs = result.scalars().all()
        
        for job in jobs:
            # Create Event from Job
            # We use the service logic manually or reuse sync?
            # calendar_service.sync_job_event requires job object
            # But wait, the service logic is "on create/update".
            # Since we inserted raw SQL (or via ORM without service layer hooks), we must trigger sync manually.
            await calendar_service.sync_job_event(db, job)
            
        logger.info("✅ Demo Data Seeding Complete!")
        logger.info("👉 Check the Calendar for Red Conflicts!")

if __name__ == "__main__":
    asyncio.run(seed_demo_data())
