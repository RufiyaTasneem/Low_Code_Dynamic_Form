from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.config.database import Base


class ResponseValue(Base):
    __tablename__ = "response_values"

    id = Column(Integer, primary_key=True, index=True)

    response_id = Column(
        Integer,
        ForeignKey("responses.id"),
        nullable=False,
    )

    field_id = Column(
        Integer,
        ForeignKey("fields.id"),
        nullable=False,
    )

    value = Column(Text)

    field = relationship("Field", back_populates="responses")