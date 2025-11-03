from fastapi import APIRouter

# 1. Create a router object
router = APIRouter(
    prefix="/session",  # All routes in this file will start with /finance
    tags=["Session"]    # Groups routes under "Finance" in the API docs
)

@router.get("/test")
async def get_stock_info():
    """
    Get financial information for a specific stock ticker.
    """
    try:
        return {
            "response": "Hola"
        }
    except Exception as e:
        return {"error": str(e)}