import uuid
from typing import Optional, List, Dict, Any
from asyncpg import Record
from library.shared.database import db

class NoteRepository:
    @staticmethod
    async def get_notes_by_content_item(user_id: uuid.UUID, content_item_id: str) -> List[Record]:
        query = """
            SELECT * FROM notes 
            WHERE user_id = $1 AND content_item_id = $2
            ORDER BY created_at DESC;
        """
        return await db.fetch(query, user_id, content_item_id)
        
    @staticmethod
    async def get_note_by_id(note_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Record]:
        query = """
            SELECT * FROM notes 
            WHERE id = $1 AND user_id = $2;
        """
        return await db.fetchrow(query, note_id, user_id)

    @staticmethod
    async def create_note(
        user_id: uuid.UUID, 
        content_item_id: str, 
        content_html: str, 
        video_timestamp: Optional[float] = None
    ) -> Record:
        query = """
            INSERT INTO notes (id, user_id, content_item_id, content_html, video_timestamp)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        """
        note_id = uuid.uuid4()
        return await db.fetchrow(query, note_id, user_id, content_item_id, content_html, video_timestamp)

    @staticmethod
    async def update_note(
        note_id: uuid.UUID, 
        user_id: uuid.UUID, 
        content_html: str, 
        video_timestamp: Optional[float] = None
    ) -> Optional[Record]:
        query = """
            UPDATE notes 
            SET content_html = $1, video_timestamp = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND user_id = $4
            RETURNING *;
        """
        return await db.fetchrow(query, content_html, video_timestamp, note_id, user_id)

    @staticmethod
    async def delete_note(note_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        query = """
            DELETE FROM notes 
            WHERE id = $1 AND user_id = $2
            RETURNING id;
        """
        result = await db.fetchrow(query, note_id, user_id)
        return bool(result)
