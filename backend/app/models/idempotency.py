from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.config.database import Base


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    id = Column(Integer, primary_key=True)

    key = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    response_id = Column(
        Integer,
        ForeignKey("responses.id"),
        nullable=False,
    )

    response = relationship("Response")