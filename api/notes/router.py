import uuid
from typing import List
from fastapi import APIRouter, Depends
from library.identity.domain.models import UserResponse
from library.notes.models import NoteCreate, NoteUpdate, NoteResponse
from library.notes.service import NoteService
from api.deps import get_current_active_user

router = APIRouter()

@router.get("/content-item/{content_item_id}", response_model=List[NoteResponse])
async def get_notes(content_item_id: str, current_user: UserResponse = Depends(get_current_active_user)):
    return await NoteService.get_notes_for_content(current_user.id, content_item_id)

@router.post("", response_model=NoteResponse)
async def create_note(note_in: NoteCreate, current_user: UserResponse = Depends(get_current_active_user)):
    return await NoteService.create_note(current_user.id, note_in)

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: uuid.UUID, note_in: NoteUpdate, current_user: UserResponse = Depends(get_current_active_user)):
    return await NoteService.update_note(note_id, current_user.id, note_in)

@router.delete("/{note_id}")
async def delete_note(note_id: uuid.UUID, current_user: UserResponse = Depends(get_current_active_user)):
    return await NoteService.delete_note(note_id, current_user.id)
