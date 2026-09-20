import asyncio
import uuid
import sys
import os

# Add parent dir to path so we can import library modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from library.shared.database import db

async def seed_data():
    print("Connecting to database...")
    await db.connect()
    
    # Clear existing data to avoid duplicates on re-run
    print("Clearing old data...")
    await db.execute("TRUNCATE courses CASCADE;")
    
    # 1. Create a Course (Hardcoded ID so Dashboard link always works)
    course_id = "79d11487-5dae-4e66-bbfb-efe2a7b960cb"
    print(f"Creating course: {course_id}")
    await db.execute(
        """
        INSERT INTO courses (id, title, description, instructor, is_published)
        VALUES ($1, $2, $3, $4, $5)
        """,
        course_id, "Advanced React & Next.js", "Master frontend development with modern tools.", "Rahul", True
    )

    # 2. Create Chapter 1
    chapter1_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO chapters (id, course_id, title, "order")
        VALUES ($1, $2, $3, $4)
        """,
        chapter1_id, course_id, "Chapter 1: Getting Started", 1
    )

    # 3. Create Sub-Chapter 1.1
    subchapter1_1_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO subchapters (id, chapter_id, title, "order")
        VALUES ($1, $2, $3, $4)
        """,
        subchapter1_1_id, chapter1_id, "Introduction to Next.js", 1
    )

    # 4. Create Section 1.1.1
    section1_1_1_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO sections (id, subchapter_id, title, "order", is_gated)
        VALUES ($1, $2, $3, $4, $5)
        """,
        section1_1_1_id, subchapter1_1_id, "What is Next.js?", 1, False # First section is usually not gated
    )

    # 5. Add Content Items to Section 1.1.1
    content1_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO content_items (id, section_id, title, content_type, media_url, text_content, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        content1_id, section1_1_1_id, "Welcome Video", "video", "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", None, 1
    )

    content2_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO content_items (id, section_id, title, content_type, media_url, text_content, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        content2_id, section1_1_1_id, "Reading Material", "text", None, "<h3>Understanding the App Router</h3><p>Next.js is a React framework that gives you building blocks to create web applications. The App Router represents the modern way of building Next.js apps...</p>", 2
    )

    content3_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO content_items (id, section_id, title, content_type, media_url, text_content, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        content3_id, section1_1_1_id, "Architecture Diagram", "pdf", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", None, 3
    )

    content4_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO content_items (id, section_id, title, content_type, media_url, text_content, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        content4_id, section1_1_1_id, "Official Documentation", "link", "https://nextjs.org/docs", "Read the official Next.js documentation for deeper insights.", 4
    )

    # Create Chapter 2 for structure
    chapter2_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO chapters (id, course_id, title, "order")
        VALUES ($1, $2, $3, $4)
        """,
        chapter2_id, course_id, "Chapter 2: Routing", 2
    )
    
    subchapter2_1_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO subchapters (id, chapter_id, title, "order")
        VALUES ($1, $2, $3, $4)
        """,
        subchapter2_1_id, chapter2_id, "App Router", 1
    )

    section2_1_1_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO sections (id, subchapter_id, title, "order", is_gated)
        VALUES ($1, $2, $3, $4, $5)
        """,
        section2_1_1_id, subchapter2_1_id, "Server Components", 1, True # Gated!
    )

    await db.disconnect()
    print("Dummy data seeded successfully!")
    print(f"Course ID for testing: {course_id}")

if __name__ == "__main__":
    asyncio.run(seed_data())
