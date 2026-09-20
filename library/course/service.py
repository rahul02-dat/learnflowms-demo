from .repository import CourseRepository

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
