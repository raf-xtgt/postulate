from fastapi import FastAPI
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

from .routers import finance
from .routers import session
from .routers import file_upload

load_dotenv()

app = FastAPI(
    title="Modular Web Service",
    description="An example app using FastAPI APIRoutiners (like Flask Blueprints)",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


url_prefix = "/ps"
app.include_router(finance.router, prefix=url_prefix)
app.include_router(session.router, prefix=url_prefix)
app.include_router(file_upload.router, prefix=url_prefix)


# A simple root endpoint
@app.get("/")
async def read_root():
    """
    Welcome endpoint.
    """
    return {"message": "Welcome! Visit /docs for the API documentation."}