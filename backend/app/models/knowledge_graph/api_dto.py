from pydantic import BaseModel
import uuid


class KGSearchQuery(BaseModel):
    query: str


class CitationDto(BaseModel):
    highlighted_text: str


class PitfallDto(BaseModel):
    draft_paper: str
    session_guid: uuid.UUID
