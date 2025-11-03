from fastapi import FastAPI
from dotenv import load_dotenv
import os

from .routers import finance
from .routers import session
load_dotenv()

app = FastAPI(
    title="Modular Web Service",
    description="An example app using FastAPI APIRoutiners (like Flask Blueprints)",
    version="1.0.0"
)

url_prefix = "/ps"
app.include_router(finance.router, prefix=url_prefix)
app.include_router(session.router, prefix=url_prefix)



# A simple root endpoint
@app.get("/")
async def read_root():
    """
    Welcome endpoint.
    """
    return {"message": "Welcome! Visit /docs for the API documentation."}