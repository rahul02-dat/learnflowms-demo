from fastapi import APIRouter, HTTPException, Depends
from library.course.service import CourseService

router = APIRouter()

def get_course_service():
    return CourseService()

@router.get("/")
async def list_courses(service: CourseService = Depends(get_course_service)):
    return {
        "success": True,
        "data": await service.get_all_courses(),
        "error": None,
        "meta": {}
    }

@router.get("/{course_id}")
async def get_course(course_id: str, service: CourseService = Depends(get_course_service)):
    course = await service.get_course_overview(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {
        "success": True,
        "data": course,
        "error": None,
        "meta": {}
    }

@router.get("/{course_id}/chapters/{chapter_id}/subchapters/{subchapter_id}/sections/{section_id}")
async def get_hierarchical_section(
    course_id: str, 
    chapter_id: str, 
    subchapter_id: str, 
    section_id: str, 
    course_service: CourseService = Depends(get_course_service)
):
    # In a full implementation, this route would validate that the section actually belongs 
    # to this specific subchapter -> chapter -> course path before returning data.
    # For now, we will just return success.
    # To fetch the content, the frontend should call the content API, or we can return it here.
    return {
        "success": True,
        "data": {"section_id": section_id, "status": "unlocked"},
        "error": None,
        "meta": {}
    }

from library.course.models import (
    CreateCourseRequest, CreateChapterRequest,
    CreateSubChapterRequest, CreateSectionRequest,
)

@router.post("/")
async def create_course(request: CreateCourseRequest, service: CourseService = Depends(get_course_service)):
    result = await service.create_course(request)
    return {
        "success": True,
        "data": result,
        "error": None,
        "meta": {}
    }

@router.post("/{course_id}/chapters")
async def create_chapter(course_id: str, request: CreateChapterRequest, service: CourseService = Depends(get_course_service)):
    result = await service.create_chapter(course_id, request)
    return {
        "success": True,
        "data": result,
        "error": None,
        "meta": {}
    }

@router.post("/{course_id}/chapters/{chapter_id}/subchapters")
async def create_subchapter(course_id: str, chapter_id: str, request: CreateSubChapterRequest, service: CourseService = Depends(get_course_service)):
    result = await service.create_subchapter(chapter_id, request)
    return {
        "success": True,
        "data": result,
        "error": None,
        "meta": {}
    }

@router.post("/{course_id}/chapters/{chapter_id}/subchapters/{subchapter_id}/sections")
async def create_section(course_id: str, chapter_id: str, subchapter_id: str, request: CreateSectionRequest, service: CourseService = Depends(get_course_service)):
    result = await service.create_section(subchapter_id, request)
    return {
        "success": True,
        "data": result,
        "error": None,
        "meta": {}
    }

