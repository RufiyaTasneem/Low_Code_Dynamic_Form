from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.config.database import Base


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)

    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)

    label = Column(String(255), nullable=False)

    type = Column(String(50), nullable=False)

    field_order = Column(Integer, nullable=False)

    config = Column(JSON, nullable=False)

    form = relationship("Form", back_populates="fields")