from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.db_config import get_db
from app.services.knowledge_graph.knowledge_graph_service import KGService

router = APIRouter(
    prefix="/kg",  
    tags=["KnowledgeGraph"] 
)

kg_service = KGService()

from typing import List
import uuid
from fastapi import Body

## TODO: Endpoint to construct knowledge graph given a list of file guids
@router.post("/construct")
async def construct_kg(
    file_guids: List[uuid.UUID] = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    await kg_service.construct_kg_from_files(file_guids, db)
    return {"message": "Knowledge graph construction started."}

