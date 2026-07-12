from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.config.database import Base
from app.models.field import Field
from app.models.form_version import FormVersion

class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)

    fields = relationship(
        "Field",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Field.field_order",
    )
    versions = relationship(
    "FormVersion",
    back_populates="form",
    cascade="all, delete-orphan",
    order_by="FormVersion.version",
)