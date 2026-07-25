from typing import Any, Literal

from pydantic import BaseModel, Field


class FranchiseAgentRequest(BaseModel):
    question: str = Field(min_length=5, max_length=1200)
    brand_id: str | None = None
    city: str | None = None
    generate_report: bool = True


class SourceReference(BaseModel):
    source_name: str
    source_url: str | None = None
    published_at: str | None = None
    credibility_level: str = "unknown"


class Evidence(BaseModel):
    evidence_id: str
    title: str
    excerpt: str
    source_url: str | None = None
    published_at: str | None = None
    document_type: str
    credibility_level: str
    brand_id: str | None = None
    city: str | None = None


class UnifiedToolResult(BaseModel):
    status: Literal["success", "insufficient_data", "error"]
    data: dict[str, Any] = Field(default_factory=dict)
    sources: list[SourceReference] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    error: str | None = None


class ToolTrace(BaseModel):
    tool_name: str
    input_summary: str
    status: Literal["running", "success", "insufficient_data", "error"]
    duration_ms: int = 0
    output_summary: str = ""


class FranchiseRiskDimension(BaseModel):
    name: str
    score: float = Field(ge=0, le=100, description="分数越高代表风险越高")
    weight: float = Field(gt=0, le=1)
    explanation: str
    evidence_ids: list[str] = Field(default_factory=list)


class BrandIdentity(BaseModel):
    brand_id: str
    brand_name: str


class FranchiseAnalysisResult(BaseModel):
    status: Literal["success", "insufficient_data", "degraded"] = "success"
    brand: BrandIdentity
    city: str
    executive_summary: str
    overall_risk_score: float = Field(ge=0, le=100)
    risk_level: str
    dimensions: list[FranchiseRiskDimension]
    major_risks: list[str]
    opportunities: list[str]
    evidence: list[Evidence]
    missing_data: list[str]
    due_diligence_questions: list[str]
    tool_trace: list[ToolTrace] = Field(default_factory=list)
    disclaimer: str = "本结果仅用于加盟前辅助尽调，不构成收益承诺或加盟建议。"


class FranchiseAgentResponse(BaseModel):
    framework: str = "LangChain single-agent + LCEL + Chroma RAG"
    agent_name: str = "Franchise Risk Agent"
    model_provider: str
    model_name: str
    execution_mode: Literal["live_agent", "deterministic_fallback", "hybrid"] = "deterministic_fallback"
    live_tool_calling_succeeded: bool = False
    callback_event_count: int = 0
    analysis: FranchiseAnalysisResult
    markdown_report: str | None = None
    cache_hit: bool = False


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    brand_id: str | None = None
    city: str | None = None
    document_type: str | None = None
    top_k: int = Field(default=5, ge=1, le=10)


class KnowledgeStatus(BaseModel):
    ready: bool
    document_count: int
    chunk_count: int
    brands: dict[str, int]
    document_types: dict[str, int]
    persist_directory: str
    embedding_model: str
    updated_at: str | None = None
