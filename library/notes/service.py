import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from library.notes.repository import NoteRepository
from library.notes.models import NoteCreate, NoteUpdate, NoteResponse

class NoteService:
    @staticmethod
    async def get_notes_for_content(user_id: uuid.UUID, content_item_id: str) -> List[NoteResponse]:
        records = await NoteRepository.get_notes_by_content_item(user_id, content_item_id)
        return [NoteResponse(**dict(r)) for r in records]

    @staticmethod
    async def create_note(user_id: uuid.UUID, note_in: NoteCreate) -> NoteResponse:
        record = await NoteRepository.create_note(
            user_id=user_id,
            content_item_id=note_in.content_item_id,
            content_html=note_in.content_html,
            video_timestamp=note_in.video_timestamp
        )
        return NoteResponse(**dict(record))

    @staticmethod
    async def update_note(note_id: uuid.UUID, user_id: uuid.UUID, note_in: NoteUpdate) -> NoteResponse:
        record = await NoteRepository.update_note(
            note_id=note_id,
            user_id=user_id,
            content_html=note_in.content_html,
            video_timestamp=note_in.video_timestamp
        )
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found or you do not have permission")
        return NoteResponse(**dict(record))

    @staticmethod
    async def delete_note(note_id: uuid.UUID, user_id: uuid.UUID):
        success = await NoteRepository.delete_note(note_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found or you do not have permission")
        return {"status": "success"}
