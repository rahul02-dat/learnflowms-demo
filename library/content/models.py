import uuid
from typing import Optional, List
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    is_consumption_rule_enabled = Column(Boolean, default=True) # Allows admin to override consumption rules
    
    section = relationship("Section", back_populates="content_items")
    mcqs = relationship("MCQQuestion", back_populates="content_item", cascade="all, delete-orphan")
    progress = relationship("ContentProgress", back_populates="content_item", cascade="all, delete-orphan")

class ContentProgress(Base):
    __tablename__ = "content_progress"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False) # Not defining a foreign key since users table might not be in SQLAlchemy metadata
    content_item_id = Column(String, ForeignKey("content_items.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=func.now())
    
    content_item = relationship("ContentItem", back_populates="progress")

class MCQQuestion(Base):
    __tablename__ = "mcq_questions"
    id = Column(String, primary_key=True, default=generate_uuid)
    content_item_id = Column(String, ForeignKey("content_items.id"), nullable=False)
    question_text = Column(String, nullable=False)
    options = Column(JSON, nullable=False) # List of strings
    correct_option_index = Column(Integer, nullable=False)
    
    content_item = relationship("ContentItem", back_populates="mcqs")

# --- Pydantic Schemas (for FastAPI) ---

class ContentItemSchema(BaseModel):
    id: str
    section_id: str
    title: str
    content_type: str
    media_url: Optional[str]
    text_content: Optional[str]
    order: int
    is_consumption_rule_enabled: bool = True
    
    class Config:
        from_attributes = True

class MCQQuestionSchema(BaseModel):
    id: str
    content_item_id: str
    question_text: str
    options: List[str]
    # We do NOT expose correct_option_index to the frontend
    
    class Config:
        from_attributes = True
