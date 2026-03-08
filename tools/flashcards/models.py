from typing import Optional

from pydantic import BaseModel


class FlashcardItem(BaseModel):
    """Single card: front (term/question) and back (definition/answer)."""
    front: str
    back: str


class GenerateRequest(BaseModel):
    """JSON body: topic and/or pasted sources."""
    topic: str = ""
    sources_text: Optional[str] = None


class GenerateResponse(BaseModel):
    """Response: list of flashcards."""
    cards: list[FlashcardItem]
