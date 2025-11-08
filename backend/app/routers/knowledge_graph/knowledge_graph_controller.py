from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List
import uuid

from app.config.db_config import get_db
from app.services.knowledge_graph.knowledge_graph_service import KGService
from app.services.knowledge_graph.kg_search_service import KGSearchService

# Define request model for search
class KGSearchQuery(BaseModel):
    query: str

router = APIRouter(
    prefix="/kg",
    tags=["KnowledgeGraph"]
)

kg_service = KGService()
kg_search_service = KGSearchService()

@router.post("/construct")
async def construct_kg(
    file_guids: List[uuid.UUID] = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    """Endpoint to construct knowledge graph given a list of file guids"""
    await kg_service.construct_kg_from_files(file_guids, db)
    return {"message": "Knowledge graph construction started."}

@router.post("/search")
async def search_kg(
    search_query: KGSearchQuery,
    db: AsyncSession = Depends(get_db)
):
    """
    Searches the Knowledge Graph based on a query.

    - Performs a semantic search to find relevant paragraphs.
    - Traces the relationships of those paragraphs in the graph.
    - Returns a list of sentences describing the findings.
    """
    explanations = await kg_search_service.search_and_explain(search_query.query, db)
    return {"explanations": explanations}

