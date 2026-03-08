"""Shared LLM client factory with key rotation."""
import random

from fastapi import HTTPException
from openai import OpenAI

from core.config import get_settings

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"


def get_llm_client() -> tuple[OpenAI, str]:
    settings = get_settings()
    groq_keys = settings.get_groq_keys()

    if groq_keys:
        key = random.choice(groq_keys)
        client = OpenAI(api_key=key, base_url=GROQ_BASE_URL)
        return client, DEFAULT_GROQ_MODEL

    if settings.openai_api_key:
        client = OpenAI(api_key=settings.openai_api_key)
        return client, DEFAULT_OPENAI_MODEL

    raise HTTPException(
        status_code=500,
        detail="No LLM API key configured. Set PLATFORM_GROQ_API_KEY in .env",
    )
