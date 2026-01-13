from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, cast, String
from app.models.job import Job
from app.models.project import Project
from app.models.event import Event
from app.schemas.search import SearchResult

class SearchService:
    async def search(self, db: AsyncSession, query: str) -> list[SearchResult]:
        results = []
        term = f"%{query}%"
        
        # Search Projects
        projects_query = await db.execute(
            select(Project)
            .where(or_(Project.name.ilike(term), Project.description.ilike(term)))
            .limit(5)
        )
        for p in projects_query.scalars():
            results.append(SearchResult(
                id=p.id, 
                type="project", 
                title=p.name, 
                description=p.description
            ))
            
        # Search Jobs
        jobs_query = await db.execute(
            select(Job)
            .where(or_(
                Job.title.ilike(term), 
                Job.description.ilike(term),
                cast(Job.job_type, String).ilike(term)
            ))
            .limit(10)
        )
        for j in jobs_query.scalars():
             results.append(SearchResult(
                 id=j.id, 
                 type="job", 
                 title=j.title, 
                 description=j.description, 
                 status=str(j.status.value) if j.status else None
             ))

        # Search Events
        events_query = await db.execute(
            select(Event)
            .where(or_(
                Event.title.ilike(term),
                cast(Event.event_type, String).ilike(term)
            ))
            .limit(5)
        )
        for e in events_query.scalars():
            results.append(SearchResult(
                id=e.id,
                type="event",
                title=e.title,
                description=f"Event ({e.event_type.value}) on {e.start.strftime('%Y-%m-%d')}"
            ))

        return results

search_service = SearchService()
