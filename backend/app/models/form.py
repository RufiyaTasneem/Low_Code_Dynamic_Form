from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.config.database import Base


class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    retention_days = Column(Integer, nullable=True, default=None)
    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="forms",
    )

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
