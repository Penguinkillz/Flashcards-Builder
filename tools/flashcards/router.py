"""FastAPI router for Flashcards endpoints."""
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from core.file_extract import extract_text_from_file
from tools.flashcards.models import GenerateRequest, GenerateResponse
from tools.flashcards.service import generate

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_from_json(payload: GenerateRequest) -> GenerateResponse:
    topic = (payload.topic or "").strip()
    sources = (payload.sources_text or "").strip()
    if not topic and not sources:
        raise HTTPException(
            status_code=400,
            detail="Provide a topic and/or paste source text.",
        )
    return generate(payload)


@router.post("/generate-from-files", response_model=GenerateResponse)
async def generate_from_files(
    topic_hint: str = Form(""),
    sources_text: str = Form(""),
    files: Optional[List[UploadFile]] = File(default=None),
) -> GenerateResponse:
    extracted_parts: list[str] = []

    if sources_text.strip():
        extracted_parts.append(sources_text.strip())

    for f in files or []:
        if not f.filename:
            continue
        text = await extract_text_from_file(f)
        if text.strip():
            extracted_parts.append(f"[From {f.filename}]\n{text.strip()}")

    if not extracted_parts:
        raise HTTPException(
            status_code=400,
            detail="Provide content: paste text and/or upload a PDF or DOCX file.",
        )

    combined = "\n\n".join(extracted_parts)
    topic = topic_hint.strip() if topic_hint.strip() else combined[:300]

    return generate(
        GenerateRequest(
            topic=topic,
            sources_text=combined,
        )
    )
