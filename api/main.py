from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from library.shared.config import settings
from library.shared.database import db
from api.auth.router import router as auth_router
from api.courses.router import router as courses_router
from api.content.router import router as content_router

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(courses_router, prefix=f"{settings.API_V1_STR}/courses", tags=["courses"])
app.include_router(content_router, prefix=f"{settings.API_V1_STR}/content", tags=["content"])

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "ok"}
