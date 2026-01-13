from typing import List, Optional, Literal
from pydantic import BaseModel

class SearchResult(BaseModel):
    id: int
    type: Literal["project", "job", "event"]
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    
class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
