import asyncpg
from typing import Optional
from .config import settings

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if not self.pool:
            self.pool = await asyncpg.create_pool(dsn=settings.DATABASE_URL)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def fetch(self, query: str, *args):
        if not self.pool:
            raise Exception("Database pool not initialized")
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        if not self.pool:
            raise Exception("Database pool not initialized")
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetchval(self, query: str, *args):
        if not self.pool:
            raise Exception("Database pool not initialized")
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

    async def execute(self, query: str, *args):
        if not self.pool:
            raise Exception("Database pool not initialized")
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)

db = Database()
