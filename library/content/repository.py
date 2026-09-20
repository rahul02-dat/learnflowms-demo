from library.shared.database import db

class ContentRepository:
    async def get_content_items_by_section(self, section_id: str) -> list[dict]:
        query = """
        SELECT id, section_id, title, content_type, media_url, text_content, "order"
        FROM content_items
        WHERE section_id = $1
        ORDER BY "order" ASC;
        """
        rows = await db.fetch(query, section_id)
        return [dict(row) for row in rows]

    async def get_content_item(self, content_id: str) -> dict | None:
        query = """
        SELECT id, section_id, title, content_type, media_url, text_content, "order"
        FROM content_items
        WHERE id = $1;
        """
        row = await db.fetchrow(query, content_id)
        return dict(row) if row else None
