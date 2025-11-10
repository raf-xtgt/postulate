from sqlalchemy import Column, String, Text, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.config.db_config import Base


class PSSignificanceAnalysisDB(Base):
    __tablename__ = "ps_significance_analysis"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_guid = Column(UUID(as_uuid=True), index=True)
    status = Column(String(20))
    significance = Column(Text)
    feedback = Column(JSON)
    created_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class PSSignificanceAnalysisBase(BaseModel):
    session_guid: Optional[uuid.UUID] = None
    status: Optional[str] = None
    significance: Optional[str] = None
    feedback: Optional[List[str]] = None


class PSSignificanceAnalysisCreate(PSSignificanceAnalysisBase):
    pass


class PSSignificanceAnalysis(PSSignificanceAnalysisBase):
    guid: uuid.UUID
    created_date: datetime

    class Config:
        orm_mode = True
