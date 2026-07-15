from pydantic import BaseModel, Field


class BrandProfile(BaseModel):
    brand_id: str
    brand_name: str
    category: str = Field(description="大众茶饮、中高端茶饮、大众咖啡、品质及场景等")
    price_band: str
    store_scale: str
    franchise_maturity: int = Field(ge=1, le=5)
    public_sentiment: str
    risk_tags: list[str] = Field(default_factory=list)

