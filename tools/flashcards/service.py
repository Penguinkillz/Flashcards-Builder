"""Flashcard generation via shared orchestrator package."""
from __future__ import annotations

import json

from fastapi import HTTPException

from tools.flashcards.flashcards_adapter import FLASHCARDS_ADAPTER, request_to_task
from tools.flashcards.models import GenerateRequest, GenerateResponse
from tools.flashcards.orchestrator_bootstrap import get_orchestrator_runtime


def generate(payload: GenerateRequest) -> GenerateResponse:
    try:
        rt = get_orchestrator_runtime()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        task = request_to_task(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        plan = rt.planner.plan(task, rt.key_manager)
        result = rt.executor.execute(
            plan,
            task,
            FLASHCARDS_ADAPTER,
            task_id=task.id,
            response_json=True,
        )
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502, detail=f"Failed to parse model output: {exc}"
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM API error: {exc}") from exc

    if not isinstance(result, list):
        raise HTTPException(
            status_code=502,
            detail="Unexpected orchestrator output (expected list of cards).",
        )

    return GenerateResponse(cards=result)
