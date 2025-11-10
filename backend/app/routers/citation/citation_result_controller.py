from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.citation.ps_citation_result import PSCitationResultCreate, PSCitationResult
from app.config.db_config import get_db
from app.services.citation.citation_result_service import CitationResultService
import uuid

router = APIRouter(
    prefix="/citation",
    tags=["Citation Result"]
)

citation_result_service = CitationResultService()


@router.post("/create", response_model=PSCitationResult)
async def create_citation_result(
    citation_result: PSCitationResultCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new citation result.
    """
    return await citation_result_service.create_citation_result(db=db, citation_result=citation_result)


@router.get("/session/{session_guid}", response_model=list[PSCitationResult])
async def get_citation_results_by_session(
    session_guid: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all citation results for a given session_guid, ordered by relevance_score (descending).
    """
    return await citation_result_service.get_citation_results_by_session(db=db, session_guid=session_guid)


@router.get("/{citation_guid}", response_model=PSCitationResult)
async def get_citation_result_by_guid(
    citation_guid: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a single citation result by its guid.
    """
    return await citation_result_service.get_citation_result_by_guid(db=db, citation_guid=citation_guid)
