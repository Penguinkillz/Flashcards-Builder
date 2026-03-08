"""
Flashcards — standalone entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from tools.flashcards.router import router as flashcards_router

app = FastAPI(title="Flashcards", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flashcards_router, prefix="/api")
app.mount("/", StaticFiles(directory="tools/flashcards/frontend", html=True), name="frontend")
