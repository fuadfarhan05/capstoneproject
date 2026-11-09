from fastapi import Depends, FastAPI
from app.auth import get_current_user
from app.routes.events import router as events_router
from app.routes.health import router as health_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Entry point for the API. This file creates the FastAPI app and attaches route groups.
app = FastAPI(title="Travel Activity Discovery API")
app.add_middleware( #tells FastAPI which frontend addresses we trust, and registers the CORS middleware
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
# Every /api route requires a valid Firebase token. /health stays public.
app.include_router(events_router, prefix="/api", dependencies=[Depends(get_current_user)])


@app.get("/")
async def root():
    return {"message": "Travel Activity Discovery API"}