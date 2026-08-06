from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.config.database import Base


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)

    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)

    label = Column(JSONB, nullable=False, default=dict)

    type = Column(String(50), nullable=False)

    field_order = Column(Integer, nullable=False)

    config = Column(JSONB, nullable=False)

    form = relationship("Form", back_populates="fields")
    responses = relationship(
        "ResponseValue",
        back_populates="field",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    triggered_rules = relationship(
        "ConditionalRule",
        back_populates="trigger_field",
        cascade="all, delete-orphan",
        foreign_keys="ConditionalRule.trigger_field_id",
        passive_deletes=True,
    )
    targeted_rules = relationship(
        "ConditionalRule",
        back_populates="target_field",
        cascade="all, delete-orphan",
        foreign_keys="ConditionalRule.target_field_id",
        passive_deletes=True,
    )