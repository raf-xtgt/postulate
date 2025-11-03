from fastapi import FastAPI
from dotenv import load_dotenv
import os

# Import the router modules
from .routers import finance
from .routers import session
# Load environment variables from .env file (optional, but good practice)
load_dotenv()

# Create the main FastAPI app instance
app = FastAPI(
    title="Modular Web Service",
    description="An example app using FastAPI APIRoutiners (like Flask Blueprints)",
    version="1.0.0"
)

# 2. Include the routers into the main app
# All routes from finance.py are now included, prefixed with /finance
app.include_router(finance.router)
app.include_router(session.router)



# A simple root endpoint
@app.get("/")
async def read_root():
    """
    Welcome endpoint.
    """
    return {"message": "Welcome! Visit /docs for the API documentation."}