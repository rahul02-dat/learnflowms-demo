import uuid
from typing import Optional
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from library.shared.models import Base

# --- SQLAlchemy Models ---

def generate_uuid():
    return str(uuid.uuid4())

class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(String)
    instructor = Column(String)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    chapters = relationship("Chapter", back_populates="course", order_by="Chapter.order", cascade="all, delete-orphan")

class Chapter(Base):
    __tablename__ = "chapters"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    order = Column(Integer, nullable=False, default=0)
    
    course = relationship("Course", back_populates="chapters")
    subchapters = relationship("SubChapter", back_populates="chapter", order_by="SubChapter.order", cascade="all, delete-orphan")

class SubChapter(Base):
    __tablename__ = "subchapters"
    id = Column(String, primary_key=True, default=generate_uuid)
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=False)
    title = Column(String, nullable=False)
    order = Column(Integer, nullable=False, default=0)
    
    chapter = relationship("Chapter", back_populates="subchapters")
    sections = relationship("Section", back_populates="subchapter", order_by="Section.order", cascade="all, delete-orphan")

class Section(Base):
    __tablename__ = "sections"
    id = Column(String, primary_key=True, default=generate_uuid)
    subchapter_id = Column(String, ForeignKey("subchapters.id"), nullable=False)
    title = Column(String, nullable=False)
    order = Column(Integer, nullable=False, default=0)
    is_gated = Column(Boolean, default=True)
    
    subchapter = relationship("SubChapter", back_populates="sections")
    content_items = relationship("ContentItem", back_populates="section", order_by="ContentItem.order", cascade="all, delete-orphan")


# --- Pydantic Schemas (for FastAPI) ---

class SectionSchema(BaseModel):
    id: str
    subchapter_id: str
    title: str
    order: int
    is_gated: bool
    
    class Config:
        from_attributes = True

class SubChapterSchema(BaseModel):
    id: str
    chapter_id: str
    title: str
    order: int
    sections: list[SectionSchema] = []
    
    class Config:
        from_attributes = True

class ChapterSchema(BaseModel):
    id: str
    course_id: str
    title: str
    order: int
    subchapters: list[SubChapterSchema] = []
    
    class Config:
        from_attributes = True

class CourseSchema(BaseModel):
    id: str
    title: str
    description: Optional[str]
    instructor: Optional[str]
    is_published: bool
    chapters: list[ChapterSchema] = []
    
    class Config:
        from_attributes = True
