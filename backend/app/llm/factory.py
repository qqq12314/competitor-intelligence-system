from langchain_openai import ChatOpenAI

from app.core.config import settings


def create_chat_model(*, temperature: float = 0.0, model: str | None = None) -> ChatOpenAI:
    if settings.llm_provider != "deepseek":
        raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")
    if not settings.deepseek_api_key:
        raise RuntimeError("DEEPSEEK_API_KEY is not configured")
    return ChatOpenAI(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url,
        model=model or settings.deepseek_model,
        temperature=temperature,
        timeout=settings.deepseek_timeout_seconds,
        max_retries=1,
    )


def model_status() -> dict[str, str | bool | int]:
    return {
        "provider": settings.llm_provider,
        "model": settings.deepseek_model,
        "configured": bool(settings.deepseek_api_key),
        "timeout_seconds": settings.deepseek_timeout_seconds,
    }
