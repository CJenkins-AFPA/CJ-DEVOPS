from fastapi import FastAPI
from app.core.config import settings
from app.api.api_v1.endpoints import login, users, projects, jobs, repos, runs, calendar, search

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

app.include_router(login.router, prefix=f"{settings.API_V1_STR}", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
# Note: jobs endpoints are defined as /projects/{id}/jobs in the router, so we mount it such that prefixes align.
# To keep it simple, jobs router currently defines paths relative to root for /projects/... 
# So we can just mount it at API_V1_STR
app.include_router(jobs.router, prefix=f"{settings.API_V1_STR}", tags=["jobs"])
app.include_router(repos.router, prefix=f"{settings.API_V1_STR}", tags=["repos"])
app.include_router(runs.router, prefix=f"{settings.API_V1_STR}", tags=["runs"])
app.include_router(calendar.router, prefix=f"{settings.API_V1_STR}/calendar", tags=["calendar"])
app.include_router(search.router, prefix=f"{settings.API_V1_STR}/search", tags=["search"])

@app.get("/health")
def health_check():
    return {"status": "ok", "app_name": settings.PROJECT_NAME}

@app.get("/")
def root():
    return {"message": "Welcome to uHub API"}
