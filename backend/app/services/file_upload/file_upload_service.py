from sqlalchemy.ext.asyncio import AsyncSession
from app.models.file.ps_file_item import PSFileItemCreate, PSFileItemDB

class FileUploadService:

    # TODO: Create a method to upload a file to google cloud storage and retrieve the file name, file url and mime_type

    async def get_file_by_guid(self, db: AsyncSession, guid: str) -> PSFileItemDB:
        """
        Retrieves a file from the database by its GUID.
        """
        return await db.get(PSFileItemDB, guid)

    async def create_file_upload_record(self, db: AsyncSession, file_upload: PSFileItemCreate) -> PSFileItemDB:
        """
        Creates a new session in the database.
        """
        db_session = PSFileItemDB(**file_upload.dict())
        db.add(db_session)
        await db.commit()
        await db.refresh(db_session)
        return db_session
