from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.significance.ps_significance_analysis import (
    PSSignificanceAnalysisCreate,
    PSSignificanceAnalysisDB
)
import uuid


class SignificanceAnalysisService:
    async def create_significance_analysis(
        self, db: AsyncSession, significance_analysis: PSSignificanceAnalysisCreate
    ) -> PSSignificanceAnalysisDB:
        """
        Creates a new significance analysis in the database.
        """
        db_significance_analysis = PSSignificanceAnalysisDB(**significance_analysis.dict())
        db.add(db_significance_analysis)
        await db.commit()
        await db.refresh(db_significance_analysis)
        return db_significance_analysis

    async def get_significance_analyses_by_session(
        self, db: AsyncSession, session_guid: uuid.UUID
    ) -> list[PSSignificanceAnalysisDB]:
        """
        Retrieves all significance analyses for a given session_guid, ordered by created_date (descending).
        """
        result = await db.execute(
            select(PSSignificanceAnalysisDB)
            .where(PSSignificanceAnalysisDB.session_guid == session_guid)
            .order_by(PSSignificanceAnalysisDB.created_date.desc())
        )
        return result.scalars().all()

    async def get_significance_analysis_by_guid(
        self, db: AsyncSession, analysis_guid: uuid.UUID
    ) -> PSSignificanceAnalysisDB | None:
        """
        Retrieves a single significance analysis by its guid.
        """
        result = await db.execute(
            select(PSSignificanceAnalysisDB).where(PSSignificanceAnalysisDB.guid == analysis_guid)
        )
        return result.scalar_one_or_none()
