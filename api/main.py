from fastapi import FastAPI
from contextlib import asynccontextmanager
from library.shared.config import settings
from library.shared.database import db
from api.auth.router import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect()
    yield
    # Shutdown
    await db.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
