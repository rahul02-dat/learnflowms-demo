from fastapi import APIRouter, HTTPException, Depends
from library.content.service import ContentService

router = APIRouter()

def get_content_service():
    return ContentService()

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
