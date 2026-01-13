from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.services.search_service import search_service
from app.schemas.search import SearchResponse

router = APIRouter()

@router.get("/", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    results = await search_service.search(db, q)
    return {"results": results, "total": len(results)}
