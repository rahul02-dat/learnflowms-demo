import asyncio
import asyncpg
import sys
import os

# Add the project root to the python path so it can find the 'library' package
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from library.shared.config import settings

async def apply_migrations():
    print("Connecting to database...")
    conn = await asyncpg.connect(settings.DATABASE_URL)
    
    print("Applying 001_initial_schema.sql...")
    with open("scripts/migrations/001_initial_schema.sql", "r") as f:
        sql = f.read()
    
    await conn.execute(sql)
    print("Migrations applied successfully!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(apply_migrations())
