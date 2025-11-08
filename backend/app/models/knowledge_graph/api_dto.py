from pydantic import BaseModel

class KGSearchQuery(BaseModel):
    query: str


class CitationDto(BaseModel):
    highlighted_text: str


class PitfallDto(BaseModel):
    draft_paper: str
