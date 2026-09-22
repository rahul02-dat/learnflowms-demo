import asyncio
import uuid
import json
import os
from dotenv import load_dotenv

import asyncpg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://learnflow:learnflow_pass@localhost:5432/learnflow_db")

async def seed_mcqs():
    conn = await asyncpg.connect(DATABASE_URL)
    
    # Get all content items
    content_items = await conn.fetch("SELECT id FROM content_items")
    print(f"Found {len(content_items)} content items.")
    
    for item in content_items:
        content_id = item['id']
        
        # Check if MCQs already exist for this content
        existing = await conn.fetchval("SELECT COUNT(*) FROM mcq_questions WHERE content_item_id = $1", content_id)
        if existing > 0:
            print(f"MCQs already exist for content {content_id}, skipping.")
            continue
            
        # Insert 3 random dummy MCQs for each content item
        mcqs = [
            {
                "question_text": "What is the primary purpose of this section?",
                "options": json.dumps(["To confuse the reader", "To introduce key concepts", "To skip directly to the end", "None of the above"]),
                "correct_index": 1
            },
            {
                "question_text": "Which of these is a best practice mentioned in this module?",
                "options": json.dumps(["Ignoring errors", "Writing tests", "Deleting production data", "Using global variables"]),
                "correct_index": 1
            },
            {
                "question_text": "How often should you review this material?",
                "options": json.dumps(["Never", "Only before an exam", "Regularly to ensure retention", "Once a decade"]),
                "correct_index": 2
            }
        ]
        
        for mcq in mcqs:
            await conn.execute("""
                INSERT INTO mcq_questions (id, content_item_id, question_text, options, correct_option_index)
                VALUES ($1, $2, $3, $4, $5)
            """, str(uuid.uuid4()), content_id, mcq['question_text'], mcq['options'], mcq['correct_index'])
            
        print(f"Inserted dummy MCQs for content {content_id}")
        
    await conn.close()
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_mcqs())
