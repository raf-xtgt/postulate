from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.significance.ps_significance_analysis import (
    PSSignificanceAnalysisCreate,
    PSSignificanceAnalysis
)
from app.config.db_config import get_db
from app.services.significance.significance_analysis_service import SignificanceAnalysisService
import uuid

router = APIRouter(
    prefix="/significance-analysis",
    tags=["Significance Analysis"]
)

significance_analysis_service = SignificanceAnalysisService()


@router.post("/create", response_model=PSSignificanceAnalysis)
async def create_significance_analysis(
    significance_analysis: PSSignificanceAnalysisCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new significance analysis.
    """
    return await significance_analysis_service.create_significance_analysis(
        db=db, 
        significance_analysis=significance_analysis
    )


@router.get("/session/{session_guid}", response_model=list[PSSignificanceAnalysis])
async def get_significance_analyses_by_session(
    session_guid: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all significance analyses for a given session_guid, ordered by created_date (descending).
    """
    return await significance_analysis_service.get_significance_analyses_by_session(
        db=db, 
        session_guid=session_guid
    )


@router.get("/{analysis_guid}", response_model=PSSignificanceAnalysis)
async def get_significance_analysis_by_guid(
    analysis_guid: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a single significance analysis by its guid.
    """
    return await significance_analysis_service.get_significance_analysis_by_guid(
        db=db, 
        analysis_guid=analysis_guid
    )
