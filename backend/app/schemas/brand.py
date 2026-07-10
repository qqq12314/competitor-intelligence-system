from pydantic import BaseModel, ConfigDict, Field


class BrandBase(BaseModel):
    brand_name: str = Field(..., max_length=80)
    category: str = Field(..., max_length=40)
    price_band: str = Field(..., max_length=40)
    target_users: str = Field(..., max_length=200)
    positioning: str = Field(..., max_length=240)
    store_scale: str = Field(..., max_length=120)
    main_products: str = Field(..., max_length=240)
    new_product_frequency: str = Field(..., max_length=20)
    marketing_style: str = Field(..., max_length=200)
    user_rating: float = Field(..., ge=0, le=5)
    strengths: str
    pressures: str
    benchmark_notes: str


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    brand_name: str | None = Field(default=None, max_length=80)
    category: str | None = Field(default=None, max_length=40)
    price_band: str | None = Field(default=None, max_length=40)
    target_users: str | None = Field(default=None, max_length=200)
    positioning: str | None = Field(default=None, max_length=240)
    store_scale: str | None = Field(default=None, max_length=120)
    main_products: str | None = Field(default=None, max_length=240)
    new_product_frequency: str | None = Field(default=None, max_length=20)
    marketing_style: str | None = Field(default=None, max_length=200)
    user_rating: float | None = Field(default=None, ge=0, le=5)
    strengths: str | None = None
    pressures: str | None = None
    benchmark_notes: str | None = None


class BrandRead(BrandBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
