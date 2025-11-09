from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.session.ps_session import PSSessionCreate, PSSessionDB
import uuid

class SessionService:
    async def create_session(self, db: AsyncSession, session: PSSessionCreate) -> PSSessionDB:
        """
        Creates a new session in the database.
        """
        db_session = PSSessionDB(**session.dict())
        db.add(db_session)
        await db.commit()
        await db.refresh(db_session)
        return db_session

    async def get_sessions_by_user(self, db: AsyncSession, user_guid: uuid.UUID) -> list[PSSessionDB]:
        """
        Retrieves all sessions for a given user_guid, ordered by last_update date (descending).
        """
        result = await db.execute(
            select(PSSessionDB)
            .where(PSSessionDB.user_guid == user_guid)
            .order_by(PSSessionDB.last_update.desc())
        )
        return result.scalars().all()
