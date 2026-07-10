from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "tea-coffee-competitor-analysis"
    app_env: str = "development"

    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-v4-flash"

    database_url: str = "sqlite:///./competitor_intelligence.db"
    vector_db_dir: str = "./data/chroma"
    embedding_model: str = "BAAI/bge-small-zh-v1.5"

    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_url: str = "http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
