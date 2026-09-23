from .repository import CourseRepository
from .models import (
    CreateCourseRequest, CreateChapterRequest,
    CreateSubChapterRequest, CreateSectionRequest,
)

class CourseService:
    def __init__(self):
        self.repo = CourseRepository()

    async def get_course_overview(self, course_id: str) -> dict | None:
        """
        Retrieves the full course tree. In a real application, 
        this would also check if the user is enrolled and filter locked sections.
        """
        return await self.repo.get_course_tree(course_id)
    
    async def get_all_courses(self) -> list[dict]:
        return await self.repo.get_all_courses()

    async def create_course(self, request: CreateCourseRequest) -> dict:
        """Create a new course."""
        return await self.repo.create_course(request.dict())

    async def create_chapter(self, course_id: str, request: CreateChapterRequest) -> dict:
        """Create a chapter under a course."""
        return await self.repo.create_chapter(course_id, request.dict())

    async def create_subchapter(self, chapter_id: str, request: CreateSubChapterRequest) -> dict:
        """Create a subchapter under a chapter."""
        return await self.repo.create_subchapter(chapter_id, request.dict())

    async def create_section(self, subchapter_id: str, request: CreateSectionRequest) -> dict:
        """Create a section under a subchapter."""
        return await self.repo.create_section(subchapter_id, request.dict())

