import uuid
from typing import Optional
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from library.shared.models import Base

# --- SQLAlchemy Models ---

def generate_uuid():
    return str(uuid.uuid4())

class ContentItem(Base):
    __tablename__ = "content_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    section_id = Column(String, ForeignKey("sections.id"), nullable=False)
    title = Column(String, nullable=False)
    content_type = Column(String, nullable=False) # video, audio, pdf, text, link, embed
    media_url = Column(String) # For video/audio/pdf source URL
    text_content = Column(String) # For rich text
    order = Column(Integer, nullable=False, default=0)
    
    section = relationship("Section", back_populates="content_items")


# --- Pydantic Schemas (for FastAPI) ---

class ContentItemSchema(BaseModel):
    id: str
    section_id: str
    title: str
    content_type: str
    media_url: Optional[str]
    text_content: Optional[str]
    order: int
    
    class Config:
        from_attributes = True
