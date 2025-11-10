from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.pitfall.ps_pitfall import PSPitfallCreate, PSPitfallDB
import uuid


class PitfallService:
    async def create_pitfall(
        self, db: AsyncSession, pitfall: PSPitfallCreate
    ) -> PSPitfallDB:
        """
        Creates a new pitfall analysis in the database.
        """
        # Convert Pydantic models to dict for JSON storage
        pitfall_dict = pitfall.dict()
        
        # Convert nested Pydantic models to dicts for JSON columns
        if pitfall_dict.get("novelty_analysis"):
            pitfall_dict["novelty_analysis"] = pitfall_dict["novelty_analysis"]
        if pitfall_dict.get("methodology_analysis"):
            pitfall_dict["methodology_analysis"] = pitfall_dict["methodology_analysis"]
        if pitfall_dict.get("significance_analysis"):
            pitfall_dict["significance_analysis"] = pitfall_dict["significance_analysis"]
        if pitfall_dict.get("contradiction_alerts"):
            pitfall_dict["contradiction_alerts"] = pitfall_dict["contradiction_alerts"]
        
        db_pitfall = PSPitfallDB(**pitfall_dict)
        db.add(db_pitfall)
        await db.commit()
        await db.refresh(db_pitfall)
        return db_pitfall

    async def get_pitfalls_by_session(
        self, db: AsyncSession, session_guid: uuid.UUID
    ) -> list[PSPitfallDB]:
        """
        Retrieves all pitfall analyses for a given session_guid, ordered by created_date (descending).
        """
        result = await db.execute(
            select(PSPitfallDB)
            .where(PSPitfallDB.session_guid == session_guid)
            .order_by(PSPitfallDB.created_date.desc())
        )
        return result.scalars().all()

    async def get_pitfall_by_guid(
        self, db: AsyncSession, pitfall_guid: uuid.UUID
    ) -> PSPitfallDB | None:
        """
        Retrieves a single pitfall analysis by its guid.
        """
        result = await db.execute(
            select(PSPitfallDB).where(PSPitfallDB.guid == pitfall_guid)
        )
        return result.scalar_one_or_none()
