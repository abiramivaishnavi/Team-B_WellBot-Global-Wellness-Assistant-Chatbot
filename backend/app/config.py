from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
  supabase_url: str
  supabase_service_key: str
  google_api_key: str

  class Config:
    env_file = ".env"
    env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
  return Settings()

