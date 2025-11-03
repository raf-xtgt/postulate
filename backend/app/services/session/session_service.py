from sqlalchemy.ext.asyncio import AsyncSession
from app.models.session.ps_session import PSSessionCreate, PSSessionDB

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
