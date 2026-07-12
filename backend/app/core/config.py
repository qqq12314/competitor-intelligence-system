from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "茶饮咖啡小微商户轻量化信贷风控系统"
    deepseek_api_key: str | None = None
    deepseek_base_url: str = "https://api.deepseek.com"
    database_url: str = "sqlite:///./tea_coffee_risk.db"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

