from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_model import PSUserCreate, PSUserDB

class UserService:
    """
    Service layer for handling User-related database operations.
    """
    async def create_user(self, db: AsyncSession, user: PSUserCreate) -> PSUserDB:
        """
        Creates a new user record in the database using the provided schema data.
        """
        db_user = PSUserDB(**user.model_dump(exclude_unset=True))
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user