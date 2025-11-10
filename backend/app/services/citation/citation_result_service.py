from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.citation.ps_citation_result import PSCitationResultCreate, PSCitationResultDB
import uuid


class CitationResultService:
    async def create_citation_result(
        self, db: AsyncSession, citation_result: PSCitationResultCreate
    ) -> PSCitationResultDB:
        """
        Creates a new citation result in the database.
        """
        db_citation_result = PSCitationResultDB(**citation_result.dict())
        db.add(db_citation_result)
        await db.commit()
        await db.refresh(db_citation_result)
        return db_citation_result

    async def get_citation_results_by_session(
        self, db: AsyncSession, session_guid: uuid.UUID
    ) -> list[PSCitationResultDB]:
        """
        Retrieves all citation results for a given session_guid, ordered by relevance_score (descending).
        """
        result = await db.execute(
            select(PSCitationResultDB)
            .where(PSCitationResultDB.session_guid == session_guid)
            .order_by(PSCitationResultDB.relevance_score.desc())
        )
        return result.scalars().all()

    async def get_citation_result_by_guid(
        self, db: AsyncSession, citation_guid: uuid.UUID
    ) -> PSCitationResultDB | None:
        """
        Retrieves a single citation result by its guid.
        """
        result = await db.execute(
            select(PSCitationResultDB).where(PSCitationResultDB.guid == citation_guid)
        )
        return result.scalar_one_or_none()
