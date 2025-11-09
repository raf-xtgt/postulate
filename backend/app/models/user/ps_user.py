from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
# Assuming db_config.py or similar is available in the app/config path
from app.config.db_config import Base

# --- SQLAlchemy Model ---

class PSUserDB(Base):
    """
    SQLAlchemy model for the 'ps_user' PostgreSQL table.
    It defines the table structure and column properties.
    """
    __tablename__ = "ps_user"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True) # Assuming email can be null initially, but should be unique if present
    firestore_id = Column(Text, unique=True, nullable=True) # Text for longer IDs, also assuming unique if present
    created_date = Column(DateTime(timezone=True), server_default=func.now())


class PSUserBase(BaseModel):
    """
    Base Pydantic schema for common user attributes.
    """
    # Use EmailStr for email validation
    email: EmailStr | None = Field(default=None, description="The user's email address.")
    firestore_id: str | None = Field(default=None, description="The unique ID from the external Firestore service.")


class PSUserCreate(PSUserBase):
    """
    Schema used when creating a new user entry.
    It inherits base fields, and 'guid' and 'created_date' will be set by the DB.
    """
    # Nothing extra needed here, inherits email and firestore_id.
    pass

class PSUser(PSUserBase):
    """
    Schema used for reading user data (response model).
    Includes auto-generated fields from the database.
    """
    guid: uuid.UUID
    created_date: datetime

    class Config:
        # Enables ORM mode, allowing Pydantic to read data directly from the
        # SQLAlchemy model instance, even if it's not a dict.
        orm_mode = True