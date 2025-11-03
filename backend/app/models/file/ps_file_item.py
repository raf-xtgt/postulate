from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from app.config.db_config import Base

class PSFileItemDB(Base):
    __tablename__ = "ps_file_item"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name = Column(String(255), nullable=False)
    file_url  = Column(Text, nullable=False)
    mime_type  = Column(String(255))
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    last_update = Column(DateTime(timezone=True),  server_default=func.now(), onupdate=func.now())

class PSFileItemBase(BaseModel):
    file_name: str
    file_url: str 
    mime_type:str

class PSFileItemCreate(PSFileItemBase):
    pass

class PSFileItem(PSFileItemBase):
    guid: uuid.UUID
    created_date: datetime
    last_update: datetime

    class Config:
        orm_mode = True