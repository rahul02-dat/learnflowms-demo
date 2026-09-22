from library.shared.database import db
import uuid
import json

class ContentRepository:
    async def get_content_items_by_section(self, section_id: str) -> list[dict]:
        query = """
        SELECT id, section_id, title, content_type, media_url, text_content, "order", is_consumption_rule_enabled
        FROM content_items
        WHERE section_id = $1
        ORDER BY "order" ASC;
        """
        rows = await db.fetch(query, section_id)
        return [dict(row) for row in rows]

    async def get_content_item(self, content_id: str) -> dict | None:
        query = """
        SELECT id, section_id, title, content_type, media_url, text_content, "order", is_consumption_rule_enabled
        FROM content_items
        WHERE id = $1;
        """
        row = await db.fetchrow(query, content_id)
        return dict(row) if row else None

    async def mark_content_completed(self, user_id: str, content_item_id: str) -> None:
        query = """
        INSERT INTO content_progress (id, user_id, content_item_id, is_completed, completed_at)
        VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING; -- We don't have a unique constraint on (user_id, content_item_id) yet, so we will just insert or rely on service logic.
        """
        # Better query:
        query = """
        INSERT INTO content_progress (id, user_id, content_item_id, is_completed, completed_at)
        SELECT $1::text, $2::text, $3::text, true, CURRENT_TIMESTAMP
        WHERE NOT EXISTS (
            SELECT 1 FROM content_progress WHERE user_id = $2 AND content_item_id = $3
        );
        """
        await db.execute(query, str(uuid.uuid4()), user_id, content_item_id)
        
    async def get_content_progress(self, user_id: str, content_item_id: str) -> dict | None:
        query = """
        SELECT id, user_id, content_item_id, is_completed, completed_at
        FROM content_progress
        WHERE user_id = $1 AND content_item_id = $2;
        """
        row = await db.fetchrow(query, user_id, content_item_id)
        return dict(row) if row else None

    async def get_random_mcq(self, content_item_id: str) -> dict | None:
        # Fetch a random MCQ. In postgres, ORDER BY RANDOM() is easy.
        query = """
        SELECT id, content_item_id, question_text, options
        FROM mcq_questions
        WHERE content_item_id = $1
        ORDER BY RANDOM()
        LIMIT 1;
        """
        row = await db.fetchrow(query, content_item_id)
        if row:
            data = dict(row)
            if isinstance(data['options'], str):
                data['options'] = json.loads(data['options'])
            return data
        return None

    async def get_mcq_by_id(self, question_id: str) -> dict | None:
        query = """
        SELECT id, content_item_id, question_text, options, correct_option_index
        FROM mcq_questions
        WHERE id = $1;
        """
        row = await db.fetchrow(query, question_id)
        if row:
            data = dict(row)
            if isinstance(data['options'], str):
                data['options'] = json.loads(data['options'])
            return data
        return None
