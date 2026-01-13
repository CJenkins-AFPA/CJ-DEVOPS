from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.event import Event, EventType
from app.models.job import Job

class CalendarService:
    async def sync_job_event(self, db: AsyncSession, job: Job) -> Event | None:
        """
        Synchronize a Job with its corresponding Calendar Event.
        If Job has planned dates -> Create or Update Event.
        If Job has no planned dates -> Delete Event if exists.
        """
        
        # 1. Check if event already exists for this job
        result = await db.execute(select(Event).where(Event.job_id == job.id))
        existing_event = result.scalars().first()
        
        # 2. If Job has no planned start, it shouldn't be on calendar
        if not job.planned_start:
            if existing_event:
                await db.delete(existing_event)
                await self.update_conflicts(db, job.project_id) # Recalc as removal might verify conflict
                await db.commit()
            return None
            
        # 3. Job has planned dates, create or update event
        event_data = {
            "project_id": job.project_id,
            "job_id": job.id,
            "title": job.title,
            "start": job.planned_start,
            "end": job.planned_end,
            "event_type": EventType.job,
            "all_day": job.all_day,
            # Could add color logic here based on status or priority
        }
        
        if existing_event:
            # Update existing
            for key, value in event_data.items():
                setattr(existing_event, key, value)
            db.add(existing_event)
            await db.commit()
            await self.update_conflicts(db, job.project_id)
            await db.refresh(existing_event)
            return existing_event
        else:
            # Create new
            new_event = Event(**event_data)
            db.add(new_event)
            await db.commit()
            await self.update_conflicts(db, job.project_id)
            await db.refresh(new_event)
            return new_event

    async def update_conflicts(self, db: AsyncSession, project_id: int):
        """
        Recalculate conflicts for all events in a project.
        Simple sweep-line algorithm (O(N log N)).
        """
        if not project_id:
            return

        # Fetch all events for the project
        # Optimize: Could limit to a time range around affected event, 
        # but recalculating per project is safer for consistency.
        result = await db.execute(select(Event).where(Event.project_id == project_id))
        events = result.scalars().all()
        
        from datetime import timedelta
        
        # Reset conflict flags
        for ev in events:
            ev.conflict = False
            
        # Filter valid events (must have start)
        valid_events = [e for e in events if e.start]
        
        # Sort by start time
        sorted_events = sorted(valid_events, key=lambda e: e.start)
        
        # Check overlaps
        for i in range(len(sorted_events)):
            ev1 = sorted_events[i]
            # Default duration 1h if not specified
            ev1_end = ev1.end if ev1.end else ev1.start + timedelta(hours=1)
            
            for j in range(i + 1, len(sorted_events)):
                ev2 = sorted_events[j]
                
                if ev2.start >= ev1_end:
                    break
                
                # Overlap detected!
                ev1.conflict = True
                ev2.conflict = True
        
        # Commit changes to persist conflict flags
        await db.commit()

calendar_service = CalendarService()
