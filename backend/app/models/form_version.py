from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.config.database import Base


class FormVersion(Base):
    __tablename__ = "form_versions"

    id = Column(Integer, primary_key=True, index=True)

    form_id = Column(
        Integer,
        ForeignKey("forms.id"),
        nullable=False,
    )

    version = Column(
        Integer,
        nullable=False,
    )

    status = Column(
        String(20),
        nullable=False,
        default="Draft",
    )

    snapshot = Column(
        JSON,
        nullable=False,
    )

    published_at = Column(
        DateTime,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    form = relationship(
        "Form",
        back_populates="versions",
    )