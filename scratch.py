import asyncio
from library.shared.database import db
from library.content.service import ContentService

async def main():
    await db.connect()
    service = ContentService()
    res = await service.get_random_mcq("ab0afbdd-101d-43d1-95af-50df55ac7b8f")
    print(res)
    await db.disconnect()

asyncio.run(main())
