from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.file.ps_file_item import PSFileItemCreate, PSFileItem
from app.config.db_config import get_db
from app.services.session.session_service import SessionService
from app.config.storage_config import bucket, BUCKET_NAME
from app.services.file_upload.file_upload_service import FileUploadService

# 1. Create a router object
router = APIRouter(
    prefix="/file-upload",  # All routes in this file will start with /finance
    tags=["FileUpload"]    # Groups routes under "Finance" in the API docs
)

session_service = SessionService()
file_upload_service = FileUploadService()

@router.post("/upload-file", response_model=PSFileItem)
async def uploadFile(
    session: PSFileItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new session.
    """
    print("new session")
    return await session_service.create_session(db=db, session=session)

@router.post("/upload", response_model=PSFileItem)
async def upload_file_to_gcs(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Uploads a file to Google Cloud Storage."""
    try:
        # Create a Blob object with the desired file name in GCS
        blob = bucket.blob(file.filename)

        # Upload the file stream directly from the FastAPI UploadFile object
        # The .file attribute provides the file-like object
        blob.upload_from_file(file.file, content_type=file.content_type)
        
        file_upload = PSFileItemCreate(
            file_name=file.filename,
            file_url=f"gs://{BUCKET_NAME}/{file.filename}",
            mime_type=file.content_type
        )
        
        return await file_upload_service.create_file_upload_record(db=db, file_upload=file_upload)
    except Exception as e:
        print("error", e)
        raise HTTPException(status_code=500, detail=str(e))