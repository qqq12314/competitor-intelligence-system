from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import ai, brands, contracts, dashboard, merchants, reports, risk, spider
from app.core.config import settings
from app.db.seed import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield

app = FastAPI(
    title=settings.app_name,
    description="Tea and coffee micro-merchant credit risk and business intelligence API.",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brands.router, prefix="/api/brands", tags=["brands"])
app.include_router(merchants.router, prefix="/api/merchants", tags=["merchants"])
app.include_router(risk.router, prefix="/api/risk", tags=["risk"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["contracts"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(spider.router, prefix="/api/spider", tags=["spider-data"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai-analysis"])


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "positioning": "茶饮咖啡小微商户轻量化信贷风控与智能经营分析",
        "llm": settings.deepseek_model,
        "docs": "/docs",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}
