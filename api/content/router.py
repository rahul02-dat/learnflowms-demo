from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from library.content.service import ContentService
from api.deps import get_current_user
from library.identity.domain.models import UserResponse

router = APIRouter()

def get_content_service():
    return ContentService()

class MCQVerifyRequest(BaseModel):
    selected_index: int

@router.get("/section/{section_id}")
async def get_section_content(section_id: str, service: ContentService = Depends(get_content_service)):
    # Note: Hierarchical routing was suggested, but fetching content by section_id is more direct for the API.
    # We can add hierarchical validation in the service layer if needed.
    content = await service.get_section_content(section_id)
    return {
        "success": True,
        "data": content,
        "error": None,
        "meta": {}
    }

@router.get("/{content_id}")
async def get_content_item(content_id: str, service: ContentService = Depends(get_content_service)):
    item = await service.get_content_item(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {
        "success": True,
        "data": item,
        "error": None,
        "meta": {}
    }

@router.post("/{content_id}/progress")
async def mark_content_progress(
    content_id: str, 
    user: UserResponse = Depends(get_current_user),
    service: ContentService = Depends(get_content_service)
):
    await service.mark_content_completed(str(user.id), content_id)
    return {"success": True, "data": {"completed": True}}

@router.get("/{content_id}/progress")
async def get_content_progress(
    content_id: str, 
    user: UserResponse = Depends(get_current_user),
    service: ContentService = Depends(get_content_service)
):
    progress = await service.get_content_progress(str(user.id), content_id)
    return {"success": True, "data": progress}

@router.get("/{content_id}/mcq/random")
async def get_random_mcq(
    content_id: str, 
    user: UserResponse = Depends(get_current_user),
    service: ContentService = Depends(get_content_service)
):
    # Only return if progress is completed, or maybe allow fetching anytime?
    # For now, just return a random MCQ
    mcq = await service.get_random_mcq(content_id)
    if not mcq:
        raise HTTPException(status_code=404, detail="No MCQs found for this content")
    
    # Strip correct_option_index
    mcq.pop('correct_option_index', None)
    
    return {"success": True, "data": mcq}

@router.post("/mcq/{question_id}/verify")
async def verify_mcq_answer(
    question_id: str, 
    request: MCQVerifyRequest,
    user: UserResponse = Depends(get_current_user),
    service: ContentService = Depends(get_content_service)
):
    try:
        is_correct = await service.verify_mcq(question_id, request.selected_index)
        return {"success": True, "data": {"correct": is_correct}}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

