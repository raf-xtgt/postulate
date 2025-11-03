from fastapi import FastAPI, UploadFile, File, HTTPException
from google.cloud import storage
import os
from dotenv import load_dotenv


load_dotenv()

print("CREDS_PATH_FROM_STORAGE_CONFIG:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
BUCKET_NAME = os.getenv("GCP_BUCKET")



# Initialize the GCS client. It handles authentication automatically.
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)