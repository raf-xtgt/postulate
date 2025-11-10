from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.file.ps_file_item import PSFileItemCreate, PSFileItemDB

class FileUploadService:

    # TODO: Create a method to upload a file to google cloud storage and retrieve the file name, file url and mime_type

    async def get_file_by_guid(self, db: AsyncSession, guid: str) -> PSFileItemDB:
        """
        Retrieves a file from the database by its GUID.
        """
        return await db.get(PSFileItemDB, guid)

    async def get_all_files(self, db: AsyncSession) -> list[PSFileItemDB]:
        """
        Retrieves all files from the database, ordered by last_update date (descending).
        """
        result = await db.execute(
            select(PSFileItemDB)
            .order_by(PSFileItemDB.last_update.desc())
        )
        return result.scalars().all()

    async def create_file_upload_record(self, db: AsyncSession, file_upload: PSFileItemCreate) -> PSFileItemDB:
        """
        Creates a new session in the database.
        """
        db_session = PSFileItemDB(**file_upload.dict())
        db.add(db_session)
        await db.commit()
        await db.refresh(db_session)
        return db_session
