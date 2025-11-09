from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from app.config.db_config import Base

class PSSessionDB(Base):
    __tablename__ = "ps_sessions"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    user_guid = Column(UUID(as_uuid=True), index=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    last_update = Column(DateTime(timezone=True),  server_default=func.now(), onupdate=func.now())

class PSSessionBase(BaseModel):
    title: str
    description: str | None = None
    user_guid:  uuid.UUID | None = None

class PSSessionCreate(PSSessionBase):
    pass

class PSSession(PSSessionBase):
    guid: uuid.UUID
    created_date: datetime
    last_update: datetime

    class Config:
        orm_mode = True