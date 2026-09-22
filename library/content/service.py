from .repository import ContentRepository

class ContentService:
    def __init__(self):
        self.repo = ContentRepository()

    async def get_section_content(self, section_id: str) -> list[dict]:
        """
        Retrieves content items for a section.
        In a real application, this would enforce mastery-gating (e.g., checking if the section is unlocked).
        """
        return await self.repo.get_content_items_by_section(section_id)
    
    async def get_content_item(self, content_id: str) -> dict | None:
        return await self.repo.get_content_item(content_id)

    async def mark_content_completed(self, user_id: str, content_id: str) -> None:
        await self.repo.mark_content_completed(user_id, content_id)

    async def get_content_progress(self, user_id: str, content_id: str) -> dict | None:
        return await self.repo.get_content_progress(user_id, content_id)

    async def get_random_mcq(self, content_id: str) -> dict | None:
        return await self.repo.get_random_mcq(content_id)

    async def verify_mcq(self, question_id: str, selected_index: int) -> bool:
        question = await self.repo.get_mcq_by_id(question_id)
        if not question:
            raise ValueError("Question not found")
        return question['correct_option_index'] == selected_index
