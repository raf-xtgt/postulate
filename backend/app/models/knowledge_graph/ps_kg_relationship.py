from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import BaseModel
from app.config.db_config import Base


class PSKgRelationshipDB(Base):
    __tablename__ = "ps_kg_relationship"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_entity_guid = Column(UUID(as_uuid=True), index=True)
    target_entity_guid = Column(UUID(as_uuid=True), index=True)
    relationship_type = Column(String(255), index=True)


# ===== Pydantic Schemas =====

class PSKgRelationshipBase(BaseModel):
    source_entity_guid: uuid.UUID
    target_entity_guid: uuid.UUID
    relationship_type: str


class PSKgRelationshipCreate(PSKgRelationshipBase):
    pass


class PSKgRelationship(PSKgRelationshipBase):
    guid: uuid.UUID

    class Config:
        orm_mode = True
