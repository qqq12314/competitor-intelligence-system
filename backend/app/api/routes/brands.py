from fastapi import APIRouter, HTTPException

from app.models.brand import BrandProfile
from app.services.sample_loader import load_brands

router = APIRouter()


@router.get("", response_model=list[BrandProfile])
def list_brands() -> list[BrandProfile]:
    return load_brands()


@router.get("/{brand_id}", response_model=BrandProfile)
def get_brand(brand_id: str) -> BrandProfile:
    for brand in load_brands():
        if brand.brand_id == brand_id:
            return brand
    raise HTTPException(status_code=404, detail="Brand not found")

