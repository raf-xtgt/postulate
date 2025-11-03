from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.session.ps_session import PSSessionCreate, PSSession
from app.config.db_config import get_db
from app.services.session.session_service import SessionService

# 1. Create a router object
router = APIRouter(
    prefix="/file-upload",  # All routes in this file will start with /finance
    tags=["FileUpload"]    # Groups routes under "Finance" in the API docs
)

session_service = SessionService()

@router.post("/upload-file", response_model=PSSession)
async def create_session(
    session: PSSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new session.
    """
    print("new session")
    return await session_service.create_session(db=db, session=session)
