from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.db_config import get_db
from app.services.knowledge_graph.knowledge_graph_service import KGService

router = APIRouter(
    prefix="/kg",  
    tags=["KnowledgeGraph"] 
)

session_service = SessionService()

## TODO: Endpoint to construct knowledge graph given a list of file guids
