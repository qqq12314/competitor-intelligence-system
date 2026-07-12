from pydantic import BaseModel, Field


class ContractReviewRequest(BaseModel):
    merchant_id: str | None = None
    contract_type: str = Field(description="lease, franchise, purchase, supply")
    contract_text: str


class ContractRiskClause(BaseModel):
    clause_type: str
    risk_level: str
    evidence: str
    explanation: str
    suggestion: str


class ContractReviewResult(BaseModel):
    contract_type: str
    overall_risk_level: str
    clauses: list[ContractRiskClause]
    summary: str

