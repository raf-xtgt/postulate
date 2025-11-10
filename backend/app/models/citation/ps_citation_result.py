from sqlalchemy import Column, String, Text, DateTime, func, Numeric
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.config.db_config import Base


class PSCitationResultDB(Base):
    __tablename__ = "ps_citation_result"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_guid = Column(UUID(as_uuid=True), index=True)
    paper_title = Column(Text)
    paper_authors = Column(Text)
    paper_year = Column(String(10))
    paper_venue = Column(Text)
    paragraph_text = Column(Text, index=True)
    relevance_score = Column(Numeric(6, 3))
    context_summary = Column(Text)
    created_date = Column(DateTime(timezone=True), server_default=func.now())


class PSCitationResultBase(BaseModel):
    session_guid: Optional[uuid.UUID] = None
    paper_title: Optional[str] = None
    paper_authors: Optional[str] = None
    paper_year: Optional[str] = None
    paper_venue: Optional[str] = None
    paragraph_text: Optional[str] = None
    relevance_score: Optional[float] = None
    context_summary: Optional[str] = None


class PSCitationResultCreate(PSCitationResultBase):
    pass


class PSCitationResult(PSCitationResultBase):
    guid: uuid.UUID
    created_date: datetime

    class Config:
        orm_mode = True
