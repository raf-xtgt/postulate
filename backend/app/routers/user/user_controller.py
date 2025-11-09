from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_model import PSUserCreate, PSUser
from app.config.db_config import get_db
from app.services.user_service import UserService

# 1. Create a router object
router = APIRouter(
    prefix="/user",        # All routes in this file will start with /user
    tags=["User"]          # Groups routes under "User" in the API docs
)

# Initialize the service layer
user_service = UserService()

@router.post("/create", response_model=PSUser,)
async def create_user_route(
    user: PSUserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new user record in the database.

    - **email**: Optional. If provided, it must be unique.
    - **firestore_id**: Optional. If provided, it must be unique.

    Returns the newly created user object, including the generated GUID and creation date.
    """
    try:
        # Call the service method to handle the database interaction
        return await user_service.create_user(db=db, user=user)
    except Exception as e:
        # In a real application, you'd handle specific integrity errors (e.g., duplicate email)
        # to return a 409 Conflict, but for this generic implementation, we raise 500.
        print(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create user due to an internal error."
        )