from fastapi import APIRouter

from app.models.contract import ContractReviewRequest, ContractReviewResult
from app.services.contract_review import review_contract

router = APIRouter()


@router.post("/review", response_model=ContractReviewResult)
def review(payload: ContractReviewRequest) -> ContractReviewResult:
    return review_contract(payload)

