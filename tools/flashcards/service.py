"""Flashcard generation — build prompt, call LLM, parse JSON."""
import json
import re

from fastapi import HTTPException

from core.llm import get_llm_client
from tools.flashcards.models import FlashcardItem, GenerateRequest, GenerateResponse


def _build_prompt(payload: GenerateRequest) -> str:
    topic = (payload.topic or "").strip()
    sources = (payload.sources_text or "").strip()
    if not topic and not sources:
        raise ValueError("Provide a topic and/or source text.")

    parts = []
    if topic:
        parts.append(f"Topic: {topic}")
    if sources:
        parts.append(f"Source material (use this to create accurate flashcards):\n{sources}")

    content = "\n\n".join(parts)
    return f"""You are an expert study assistant. Create flashcards from the following.

{content}

Return ONLY valid JSON in exactly this structure (no markdown, no code fences, no control characters):
{{
  "cards": [
    {{ "front": "term or question", "back": "definition or answer" }},
    {{ "front": "...", "back": "..." }}
  ]
}}

Rules:
- Generate between 5 and 20 cards. Prefer quality over quantity.
- Each card must have "front" and "back" only. front = term or question; back = definition or answer.
- All string values must be valid JSON — escape special characters. No newlines or tabs inside values; use space instead.
- cards must be a non-empty array.""".strip()


def _sanitize(content: str) -> str:
    content = content.lstrip("\ufeff")
    content = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", content)
    return content


def _parse_response(content: str) -> dict:
    content = _sanitize(content)
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start, end = content.find("{"), content.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(content[start : end + 1])
            except json.JSONDecodeError:
                pass
        raise


def generate(payload: GenerateRequest) -> GenerateResponse:
    client, model = get_llm_client()
    prompt = _build_prompt(payload)

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a study assistant. Return clean JSON only — no markdown, no code fences.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM API error: {exc}") from exc

    raw = completion.choices[0].message.content or ""

    try:
        data = _parse_response(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502, detail=f"Failed to parse model output: {exc}"
        ) from exc

    if "cards" not in data or not isinstance(data["cards"], list):
        raise HTTPException(
            status_code=502,
            detail="Model response missing or invalid 'cards' array.",
        )

    cards: list[FlashcardItem] = []
    for i, item in enumerate(data["cards"]):
        if not isinstance(item, dict):
            continue
        front = item.get("front")
        back = item.get("back")
        if front is None or back is None:
            continue
        cards.append(
            FlashcardItem(
                front=str(front).strip() or f"Card {i + 1}",
                back=str(back).strip() or "",
            )
        )

    if not cards:
        raise HTTPException(
            status_code=502,
            detail="Model did not return any valid cards (front/back).",
        )

    return GenerateResponse(cards=cards)
