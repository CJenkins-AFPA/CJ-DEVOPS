from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.api.deps import CurrentUser
from app.core.permissions import permission_service, Action
from app.models.event import Event
from app.models.project import Project
from app.models.job import Job
from app.schemas import event as event_schema
from app.services.calendar_service import calendar_service

router = APIRouter()

@router.get("/events", response_model=List[event_schema.EventFullCalendar])
async def read_calendar_events(
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
    start: datetime = Query(..., description="Start date for calendar range"),
    end: datetime = Query(..., description="End date for calendar range"),
    project_id: int | None = Query(None, description="Filter by project ID"),
) -> Any:
    """
    Retrieve events for calendar view (FullCalendar compatible).
    """
    # Build query
    query = select(Event).where(
        Event.start >= start,
        Event.start <= end
    ).options(selectinload(Event.project), selectinload(Event.job))
    
    if project_id:
        query = query.where(Event.project_id == project_id)
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    # Convert to FullCalendar format
    fullcalendar_events = []
    for event in events:
        # Use event color, fallback to project color
        bg_color = event.color or (event.project.color if event.project else "#00ff00")
        border_color = "#ff0000" if event.conflict else bg_color
        
        fc_event = event_schema.EventFullCalendar(
            id=event.id,
            title=event.title,
            start=event.start,
            end=event.end,
            allDay=event.all_day,
            backgroundColor=bg_color,
            borderColor=border_color,
            extendedProps={
                "project_id": event.project_id,
                "job_id": event.job_id,
                "event_type": event.event_type.value,
                "conflict": event.conflict,
                "project_name": event.project.name if event.project else None
            }
        )
        fullcalendar_events.append(fc_event)
    
    return fullcalendar_events

@router.post("/events", response_model=event_schema.Event, status_code=201)
async def create_event(
    event_in: event_schema.EventCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Create a new calendar event.
    """
    # Check project exists and user has access
    result = await db.execute(select(Project).where(Project.id == event_in.project_id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    permission_service.check_project_access(current_user, project, Action.UPDATE)
    
    # Create event
    event = Event(
        project_id=event_in.project_id,
        job_id=event_in.job_id,
        title=event_in.title,
        start=event_in.start,
        end=event_in.end,
        event_type=event_in.event_type,
        color=event_in.color,
        all_day=event_in.all_day
    )
    
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    # Detect conflicts
    await calendar_service.update_conflicts(db, event.project_id)
    await db.refresh(event)
    
    return event

@router.patch("/events/{event_id}", response_model=event_schema.Event)
async def update_event(
    event_id: int,
    event_in: event_schema.EventUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Update an event (e.g., from drag-drop rescheduling).
    """
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check project access
    result = await db.execute(select(Project).where(Project.id == event.project_id))
    project = result.scalars().first()
    if project:
        permission_service.check_project_access(current_user, project, Action.UPDATE)
    
    # Update fields
    update_data = event_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    # If linked to job, update job planned times
    if event.job_id and ("start" in update_data or "end" in update_data):
        result = await db.execute(select(Job).where(Job.id == event.job_id))
        job = result.scalars().first()
        if job:
            if "start" in update_data:
                job.planned_start = update_data["start"]
            if "end" in update_data:
                job.planned_end = update_data["end"]
            db.add(job)
    
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    # Re-detect conflicts
    await calendar_service.update_conflicts(db, event.project_id)
    await db.refresh(event)
    
    return event

@router.delete("/events/{event_id}")
async def delete_event(
    event_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Delete an event.
    """
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check project access
    result = await db.execute(select(Project).where(Project.id == event.project_id))
    project = result.scalars().first()
    if project:
        permission_service.check_project_access(current_user, project, Action.DELETE)
    
    await db.delete(event)
    await calendar_service.update_conflicts(db, event.project_id)
    await db.commit()
    
    return {"message": "Event deleted successfully", "id": event_id}
