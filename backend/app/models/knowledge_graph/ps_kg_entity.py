from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from pydantic import BaseModel
from app.config.db_config import Base
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector



class PSKgEntityDB(Base):
    __tablename__ = "ps_kg_entity"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(100), index=True)
    file_guid = Column(UUID(as_uuid=True), index=True)
    content = Column(Text)
    content_vec = Column(Vector())  # no dimension specified, supports dynamic embedding sizes
    name = Column(String(255), index=True)


# ===== Pydantic Schemas =====

class PSKgEntityBase(BaseModel):
    entity_type: str | None = None
    file_guid: uuid.UUID | None = None
    content: str | None = None
    name: str | None = None


class PSKgEntityCreate(PSKgEntityBase):
    content_vec: list[float] | None = None


class PSKgEntity(PSKgEntityBase):
    guid: uuid.UUID
    content_vec: list[float] | None = None

    class Config:
        orm_mode = True
