from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import ai, brand_intel, brands, contracts, dashboard, merchants, reports, risk, spider
from app.core.config import settings
from app.db.seed import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Tea and coffee brand investment and franchise risk intelligence API.",
    version="0.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brand_intel.router, prefix="/api/brand-intel", tags=["brand-investment-franchise"])

# Legacy routes are kept for the previous credit-risk prototype so the team can reuse code and data import scripts.
app.include_router(brands.router, prefix="/api/brands", tags=["legacy-brands"])
app.include_router(merchants.router, prefix="/api/merchants", tags=["legacy-merchants"])
app.include_router(risk.router, prefix="/api/risk", tags=["legacy-risk"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["legacy-contracts"])
app.include_router(reports.router, prefix="/api/reports", tags=["legacy-reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["legacy-dashboard"])
app.include_router(spider.router, prefix="/api/spider", tags=["legacy-spider-data"])
app.include_router(ai.router, prefix="/api/ai", tags=["legacy-ai-analysis"])


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "positioning": "茶饮咖啡品牌投资与加盟风险智能分析",
        "llm": settings.deepseek_model,
        "docs": "/docs",
        "new_api": "/api/brand-intel/summary",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}
