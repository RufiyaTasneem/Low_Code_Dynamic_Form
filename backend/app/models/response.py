from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.sql import func
import secrets

from app.config.database import Base


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)

    response_uid = Column(
        String(20),
        unique=True,
        nullable=False,
        default=lambda: f"resp_{secrets.token_hex(5)}",
    )

    form_id = Column(
        Integer,
        ForeignKey("forms.id"),
        nullable=False,
    )

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )