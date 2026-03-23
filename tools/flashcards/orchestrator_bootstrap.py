"""Wire PLATFORM_* settings from core.config into orchestrator runtime."""
from __future__ import annotations

from functools import lru_cache

from core.config import get_settings
from orchestrator.models import ApiKeyEntry
from orchestrator.runtime import OrchestratorRuntime


def _api_keys_from_settings() -> list[ApiKeyEntry]:
    s = get_settings()
    keys: list[ApiKeyEntry] = []
    for i, k in enumerate(s.get_groq_keys()):
        keys.append(
            ApiKeyEntry(
                id=f"groq-{i + 1}",
                provider="groq",
                api_key=k,
                tpm_limit=12_000,
                rpm_limit=1_000,
            )
        )
    if s.openai_api_key:
        keys.append(
            ApiKeyEntry(
                id="openai-1",
                provider="openai",
                api_key=s.openai_api_key,
                tpm_limit=100_000,
                rpm_limit=500,
            )
        )
    if s.gemini_api_key:
        keys.append(
            ApiKeyEntry(
                id="gemini-1",
                provider="gemini",
                api_key=s.gemini_api_key,
                tpm_limit=250_000,
                rpm_limit=1_000,
            )
        )
    if s.openrouter_api_key:
        keys.append(
            ApiKeyEntry(
                id="openrouter-1",
                provider="openrouter",
                api_key=s.openrouter_api_key,
                tpm_limit=50_000,
                rpm_limit=20,
            )
        )
    return keys


@lru_cache
def get_orchestrator_runtime() -> OrchestratorRuntime:
    keys = _api_keys_from_settings()
    if not keys:
        raise RuntimeError(
            "No LLM API keys configured. Set PLATFORM_GROQ_API_KEY and/or "
            "PLATFORM_OPENAI_API_KEY, PLATFORM_GEMINI_API_KEY, PLATFORM_OPENROUTER_API_KEY in .env"
        )
    return OrchestratorRuntime(keys=keys, from_env=False)
