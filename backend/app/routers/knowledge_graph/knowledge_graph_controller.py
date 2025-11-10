from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List
import uuid
from app.models.knowledge_graph.api_dto import *
from app.models.citation.ps_citation_result import PSCitationResultCreate, PSCitationResult
from app.services.citation.citation_result_service import CitationResultService
from app.config.db_config import get_db
from app.services.knowledge_graph.knowledge_graph_service import KGService
from app.services.knowledge_graph.kg_search_service import KGSearchService
from app.services.knowledge_graph.kg_citation_search_service import KGCitationSearchService

router = APIRouter(
    prefix="/kg",
    tags=["KnowledgeGraph"]
)

kg_service = KGService()
kg_search_service = KGSearchService()
kg_citation_search_service = KGCitationSearchService()
citation_result_service = CitationResultService()


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



@router.post("/citation-search", response_model=list[PSCitationResult])
async def citation_search_kg(
    search_query: KGSearchQuery, 
    db: AsyncSession = Depends(get_db)
):
    """
    Performs citation search and stores results in the database.
    
    - Executes semantic search on the knowledge graph
    - Creates citation result records for each result
    - Truncates paragraph_text to 100 characters if longer
    - Returns the created citation result records
    """
    search_results = await kg_citation_search_service.citation_search(search_query.query, db)
    
    # Create citation result records for each search result
    created_citations = []
    for result in search_results:
        # Truncate paragraph_text to 100 characters if longer
        truncated_paragraph = (
            result.paragraph_text[:100] 
            if len(result.paragraph_text) > 100 
            else result.paragraph_text
        )
        
        citation_create = PSCitationResultCreate(
            session_guid=search_query.session_guid,
            paper_title=result.paper_title,
            paper_authors=result.paper_authors,
            paper_year=result.paper_year,
            paper_venue=result.paper_venue,
            paragraph_text=truncated_paragraph,
            relevance_score=result.relevance_score,
            context_summary=result.context_summary
        )
        
        created_citation = await citation_result_service.create_citation_result(
            db=db, 
            citation_result=citation_create
        )
        created_citations.append(created_citation)
    
    return created_citations

