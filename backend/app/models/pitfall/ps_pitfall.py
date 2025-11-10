from sqlalchemy import Column, String, Text, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.config.db_config import Base
from app.models.knowledge_graph.agent_response import (
    NoveltyAnalysis,
    MethodologyAnalysisOutput,
    SignificanceAnalysis,
    ContradictionListResponse,
)


class PSPitfallDB(Base):
    __tablename__ = "ps_pitfalls"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_guid = Column(UUID(as_uuid=True), nullable=False, index=True)
    draft_text = Column(Text, index=True)
    novelty_analysis = Column(JSON)
    methodology_analysis = Column(JSON)
    significance_analysis = Column(JSON)
    contradiction_alerts = Column(JSON)
    created_date = Column(DateTime(timezone=True), server_default=func.now())


class PSPitfallBase(BaseModel):
    session_guid: uuid.UUID
    draft_text: Optional[str] = None
    novelty_analysis: Optional[NoveltyAnalysis] = None
    methodology_analysis: Optional[MethodologyAnalysisOutput] = None
    significance_analysis: Optional[SignificanceAnalysis] = None
    contradiction_alerts: Optional[ContradictionListResponse] = None


class PSPitfallCreate(PSPitfallBase):
    pass


class PSPitfall(PSPitfallBase):
    guid: uuid.UUID
    created_date: datetime

    class Config:
        orm_mode = True
