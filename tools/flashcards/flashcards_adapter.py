"""ToolAdapter for flashcards — prompts, parse, merge (orchestrator engine)."""
from __future__ import annotations

import json
import re
import uuid
from typing import Any

from orchestrator.models import Chunk, Source, Task

from tools.flashcards.models import FlashcardItem, GenerateRequest

# Keep under Groq free-tier request pressure; same idea as legacy service.
_MAX_SOURCE_CHARS = 10_000

_VALID_ESCAPES = set('"\\\\/bfnrt')


def _fix_json_escapes(content: str) -> str:
    result: list[str] = []
    i = 0
    while i < len(content):
        ch = content[i]
        if ch == "\\" and i + 1 < len(content):
            nxt = content[i + 1]
            if nxt in _VALID_ESCAPES or nxt == "u":
                result.append(ch)
                result.append(nxt)
                i += 2
            else:
                result.append(nxt)
                i += 2
        else:
            result.append(ch)
            i += 1
    return "".join(result)


def _sanitize(content: str) -> str:
    content = content.lstrip("\ufeff")
    content = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", content)
    return content


def _parse_json_dict(content: str) -> dict:
    content = _sanitize(content)
    content = _fix_json_escapes(content)
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


def _cards_from_data(data: dict) -> list[FlashcardItem]:
    if "cards" not in data or not isinstance(data["cards"], list):
        raise ValueError("Model response missing or invalid 'cards' array.")
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
        raise ValueError("Model did not return any valid cards (front/back).")
    return cards


def request_to_task(payload: GenerateRequest) -> Task:
    topic = (payload.topic or "").strip()
    sources = (payload.sources_text or "").strip()
    if not topic and not sources:
        raise ValueError("Provide a topic and/or source text.")

    truncated = False
    if len(sources) > _MAX_SOURCE_CHARS:
        sources = sources[:_MAX_SOURCE_CHARS]
        truncated = True

    return Task(
        id=f"flashcards-{uuid.uuid4().hex[:12]}",
        type="flashcards",
        inputs=[
            Source(
                id="input",
                text=sources,
                meta={"topic": topic, "truncated": truncated},
            )
        ],
        output_budget_tokens=4000,
    )


def _user_block(task: Task) -> tuple[str, str, bool]:
    if not task.inputs:
        return "", "", False
    src = task.inputs[0]
    meta = src.meta or {}
    return (
        str(meta.get("topic", "")).strip(),
        (src.text or "").strip(),
        bool(meta.get("truncated", False)),
    )


def _instruction_block(content: str) -> str:
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


class FlashcardsAdapter:
    prompt_template_version = "flashcards-1"

    def build_prompt_single(self, task: Task) -> str:
        topic, sources, truncated = _user_block(task)
        if not topic and not sources:
            raise ValueError("Provide a topic and/or source text.")
        parts: list[str] = []
        if topic:
            parts.append(f"Topic: {topic}")
        if sources:
            note = " (truncated to fit model context limit)" if truncated else ""
            parts.append(f"Source material{note} (use this to create accurate flashcards):\n{sources}")
        content = "\n\n".join(parts)
        return _instruction_block(content)

    def build_prompt_for_chunk(self, task: Task, chunk: Chunk) -> str:
        topic, _, _ = _user_block(task)
        content_lines = [
            f"Topic context: {topic}" if topic else "Topic context: (see fragment only)",
            "",
            "You are processing ONE fragment of a larger document. "
            "Create flashcards ONLY for information in this fragment.",
            "",
            "Fragment:",
            chunk.text,
        ]
        return _instruction_block("\n".join(content_lines))

    def build_prompt_for_synthesis(self, merged: Any) -> str:
        """Merge/dedupe partial card lists into one JSON object."""
        if not isinstance(merged, list):
            merged = [merged]
        all_cards: list[FlashcardItem] = []
        for item in merged:
            if isinstance(item, FlashcardItem):
                all_cards.append(item)
            elif isinstance(item, list):
                all_cards.extend([x for x in item if isinstance(x, FlashcardItem)])
        if not all_cards:
            return ""
        payload = {"cards": [c.model_dump() for c in all_cards]}
        return (
            "You are merging flashcard lists from parallel extractions. "
            "Remove duplicates (same or very similar front), fix wording, "
            "and return ONE valid JSON object with a single 'cards' array only:\n\n"
            f"{json.dumps(payload, ensure_ascii=False)}"
        )

    def parse_output(self, raw: str) -> list[FlashcardItem]:
        data = _parse_json_dict(raw)
        return _cards_from_data(data)

    def merge_chunk_results(self, results: list[Any]) -> list[FlashcardItem]:
        out: list[FlashcardItem] = []
        for r in results:
            if isinstance(r, FlashcardItem):
                out.append(r)
            elif isinstance(r, list):
                for x in r:
                    if isinstance(x, FlashcardItem):
                        out.append(x)
        if not out:
            raise ValueError("No cards produced from chunks.")
        return out


FLASHCARDS_ADAPTER = FlashcardsAdapter()
