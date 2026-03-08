from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Shared platform settings.
    All env vars use the PLATFORM_ prefix.
    """

    groq_api_key: Optional[str] = None
    groq_api_key_2: Optional[str] = None
    groq_api_key_3: Optional[str] = None
    openai_api_key: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="PLATFORM_",
    )

    def get_groq_keys(self) -> List[str]:
        return [k for k in [self.groq_api_key, self.groq_api_key_2, self.groq_api_key_3] if k]


@lru_cache
def get_settings() -> Settings:
    return Settings()
