from sqlalchemy import Column, String, Float, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from library.shared.models import Base

# SQLAlchemy Model
class Note(Base):
    __tablename__ = "notes"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content_item_id = Column(String, ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, index=True)
    video_timestamp = Column(Float, nullable=True) # Optional time in seconds
    content_html = Column(String, nullable=False, default="")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Pydantic Schemas
class NoteBase(BaseModel):
    content_item_id: str
    video_timestamp: Optional[float] = None
    content_html: str

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    content_html: str
    video_timestamp: Optional[float] = None

class NoteResponse(NoteBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True
