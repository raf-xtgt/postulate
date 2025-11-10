from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.file.ps_file_item import PSFileItemCreate, PSFileItem
from app.config.db_config import get_db
from app.services.session.session_service import SessionService
from app.config.storage_config import bucket, BUCKET_NAME
from app.services.file_upload.file_upload_service import FileUploadService
from io import BytesIO

# 1. Create a router object
router = APIRouter(
    prefix="/file-upload",  # All routes in this file will start with /finance
    tags=["FileUpload"]    # Groups routes under "Finance" in the API docs
)

session_service = SessionService()
file_upload_service = FileUploadService()

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


# multi file upload
@router.post("/upload/multi", response_model=list[PSFileItem])
async def upload_multiple_files_to_gcs(
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads multiple files to Google Cloud Storage and saves metadata to the database.
    Returns a list of uploaded file metadata.
    """
    uploaded_files = []

    try:
        for file in files:
            # Create a Blob object for each file
            blob = bucket.blob(file.filename)

            # Upload the file to GCS
            blob.upload_from_file(file.file, content_type=file.content_type)

            # Create DB record
            file_upload = PSFileItemCreate(
                file_name=file.filename,
                file_url=f"gs://{BUCKET_NAME}/{file.filename}",
                mime_type=file.content_type
            )

            uploaded_file = await file_upload_service.create_file_upload_record(
                db=db, file_upload=file_upload
            )
            uploaded_files.append(uploaded_file)

        return uploaded_files

    except Exception as e:
        print("error", e)
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/list", response_model=list[PSFileItem])
async def get_all_files(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a list of all uploaded files from the database.
    Returns file metadata including guid, file_name, file_url, mime_type, and timestamps.
    """
    try:
        files = await file_upload_service.get_all_files(db=db)
        return files
    except Exception as e:
        print("error", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{guid}")
async def get_file_from_gcs(
    guid: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves a file from Google Cloud Storage."""
    try:
        file_record = await file_upload_service.get_file_by_guid(db=db, guid=guid)
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")

        blob = bucket.blob(file_record.file_name)
        if not blob.exists():
            raise HTTPException(status_code=404, detail="File not found in GCS")

        # Download the file to a BytesIO object
        file_stream = BytesIO()
        blob.download_to_file(file_stream)
        file_stream.seek(0)  # Rewind the stream to the beginning

        return StreamingResponse(
            file_stream,
            media_type=file_record.mime_type,
            headers={"Content-Disposition": f"attachment; filename={file_record.file_name}"}
        )
    except Exception as e:
        print("error", e)
        raise HTTPException(status_code=500, detail=str(e))