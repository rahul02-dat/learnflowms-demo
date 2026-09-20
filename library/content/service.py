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
