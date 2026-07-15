from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.brand import BrandProfile
from app.repositories.risk_repository import get_brand as find_brand
from app.repositories.risk_repository import list_brands as find_brands

router = APIRouter()


@router.get("", response_model=list[BrandProfile])
def list_brands(session: Session = Depends(get_db)) -> list[BrandProfile]:
    return find_brands(session)


@router.get("/{brand_id}", response_model=BrandProfile)
def get_brand(brand_id: str, session: Session = Depends(get_db)) -> BrandProfile:
    brand = find_brand(session, brand_id)
    if brand:
        return brand
    raise HTTPException(status_code=404, detail="Brand not found")
