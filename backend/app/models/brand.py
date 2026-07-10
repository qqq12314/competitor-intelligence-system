from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.core.database import Base


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    brand_name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    price_band: Mapped[str] = mapped_column(String(40))
    target_users: Mapped[str] = mapped_column(String(200))
    positioning: Mapped[str] = mapped_column(String(240))
    store_scale: Mapped[str] = mapped_column(String(120))
    main_products: Mapped[str] = mapped_column(String(240))
    new_product_frequency: Mapped[str] = mapped_column(String(20))
    marketing_style: Mapped[str] = mapped_column(String(200))
    user_rating: Mapped[float] = mapped_column(Float)
    strengths: Mapped[str] = mapped_column(Text)
    pressures: Mapped[str] = mapped_column(Text)
    benchmark_notes: Mapped[str] = mapped_column(Text)
