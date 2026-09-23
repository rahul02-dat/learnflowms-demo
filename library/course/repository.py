import json
import uuid
from library.shared.database import db
from .models import CourseSchema, ChapterSchema, SubChapterSchema, SectionSchema

class CourseRepository:
    async def get_course_tree(self, course_id: str) -> dict | None:
        query = """
        SELECT json_build_object(
            'id', c.id,
            'title', c.title,
            'description', c.description,
            'instructor', c.instructor,
            'is_published', c.is_published,
            'chapters', COALESCE((
                SELECT json_agg(
                    json_build_object(
                        'id', ch.id,
                        'course_id', ch.course_id,
                        'title', ch.title,
                        'order', ch.order,
                        'subchapters', COALESCE((
                            SELECT json_agg(
                                json_build_object(
                                    'id', sc.id,
                                    'chapter_id', sc.chapter_id,
                                    'title', sc.title,
                                    'order', sc.order,
                                    'sections', COALESCE((
                                        SELECT json_agg(
                                            json_build_object(
                                                'id', s.id,
                                                'subchapter_id', s.subchapter_id,
                                                'title', s.title,
                                                'order', s.order,
                                                'is_gated', s.is_gated
                                            ) ORDER BY s.order
                                        ) FROM sections s WHERE s.subchapter_id = sc.id
                                    ), '[]'::json)
                                ) ORDER BY sc.order
                            ) FROM subchapters sc WHERE sc.chapter_id = ch.id
                        ), '[]'::json)
                    ) ORDER BY ch.order
                ) FROM chapters ch WHERE ch.course_id = c.id
            ), '[]'::json)
        ) as course_data
        FROM courses c
        WHERE c.id = $1;
        """
        result = await db.fetchrow(query, course_id)
        if result and result['course_data']:
            # The query returns JSON directly
            return json.loads(result['course_data']) if isinstance(result['course_data'], str) else result['course_data']
        return None

    async def get_all_courses(self) -> list[dict]:
        query = """
        SELECT id, title, description, instructor, is_published
        FROM courses
        WHERE is_published = true;
        """
        rows = await db.fetch(query)
        return [dict(row) for row in rows]

    async def create_course(self, data: dict) -> dict:
        """Create a course only — no default hierarchy."""
        course_id = str(uuid.uuid4())
        query = """
        INSERT INTO courses (id, title, description, instructor, is_published)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, description, instructor, is_published;
        """
        row = await db.fetchrow(
            query, course_id,
            data.get('title'), data.get('description'),
            data.get('instructor'), data.get('is_published', False)
        )
        return dict(row) if row else {}

    async def create_chapter(self, course_id: str, data: dict) -> dict:
        """Create a chapter under the given course."""
        chapter_id = str(uuid.uuid4())
        query = """
        INSERT INTO chapters (id, course_id, title, "order")
        VALUES ($1, $2, $3, $4)
        RETURNING id, course_id, title, "order";
        """
        row = await db.fetchrow(
            query, chapter_id, course_id,
            data.get('title'), data.get('order', 0)
        )
        return dict(row) if row else {}

    async def create_subchapter(self, chapter_id: str, data: dict) -> dict:
        """Create a subchapter under the given chapter."""
        subchapter_id = str(uuid.uuid4())
        query = """
        INSERT INTO subchapters (id, chapter_id, title, "order")
        VALUES ($1, $2, $3, $4)
        RETURNING id, chapter_id, title, "order";
        """
        row = await db.fetchrow(
            query, subchapter_id, chapter_id,
            data.get('title'), data.get('order', 0)
        )
        return dict(row) if row else {}

    async def create_section(self, subchapter_id: str, data: dict) -> dict:
        """Create a section under the given subchapter."""
        section_id = str(uuid.uuid4())
        query = """
        INSERT INTO sections (id, subchapter_id, title, "order", is_gated)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, subchapter_id, title, "order", is_gated;
        """
        row = await db.fetchrow(
            query, section_id, subchapter_id,
            data.get('title'), data.get('order', 0),
            data.get('is_gated', True)
        )
        return dict(row) if row else {}

