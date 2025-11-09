from pydantic import BaseModel
from typing import List
from app.models.knowledge_graph.agent_response import (
ContradictionAnalysis)

class SingleStringResponse(BaseModel):
    """A Pydantic model for a single string response."""
    response: str

class MethodClaimResponse(BaseModel):
    """A Pydantic model for extracting method and claim text."""
    method_text: str
    claim_text: str

class ClaimListResponse(BaseModel):
    """A Pydantic model for a list of claims."""
    claims: List[str]

class ContradictionListResponse(BaseModel):
    """A Pydantic model for a list of contradiction analyses."""
    contradictions: List[ContradictionAnalysis]