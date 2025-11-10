from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.pitfall.ps_pitfall import PSPitfallCreate, PSPitfall
from app.config.db_config import get_db
from app.services.pitfall.pitfall_service import PitfallService
import uuid

router = APIRouter(
    prefix="/pitfall",
    tags=["Pitfall"]
)

pitfall_service = PitfallService()


@router.post("/create", response_model=PSPitfall)
async def create_pitfall(
    pitfall: PSPitfallCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new pitfall analysis.
    """
    return await pitfall_service.create_pitfall(db=db, pitfall=pitfall)


@router.get("/session/{session_guid}", response_model=list[PSPitfall])
async def get_pitfalls_by_session(
    session_guid: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all pitfall analyses for a given session_guid, ordered by created_date (descending).
    """
    return await pitfall_service.get_pitfalls_by_session(db=db, session_guid=session_guid)


@router.get("/{pitfall_guid}", response_model=PSPitfall)
async def get_pitfall_by_guid(
    pitfall_guid: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a single pitfall analysis by its guid.
    """
    return await pitfall_service.get_pitfall_by_guid(db=db, pitfall_guid=pitfall_guid)
