from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.session.ps_session import PSSessionCreate, PSSession
from app.config.db_config import get_db
from app.services.session.session_service import SessionService
import uuid

# 1. Create a router object
router = APIRouter(
    prefix="/session",  # All routes in this file will start with /finance
    tags=["Session"]    # Groups routes under "Finance" in the API docs
)

session_service = SessionService()

@router.post("/create", response_model=PSSession)
async def create_session(
    session: PSSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new session.
    """
    print("new session")
    return await session_service.create_session(db=db, session=session)

@router.get("/listing/{user_guid}", response_model=list[PSSession])
async def get_sessions_by_user(
    user_guid: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all sessions for a given user_guid, ordered by last_update date (descending).
    """
    return await session_service.get_sessions_by_user(db=db, user_guid=user_guid)
