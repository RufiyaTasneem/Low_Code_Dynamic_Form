from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.config.database import Base

class ConditionalRule(Base):
    __tablename__ = "conditional_rules"

    id = Column(Integer, primary_key=True, index=True)

    form_id = Column(
        Integer,
        ForeignKey("forms.id", ondelete="CASCADE"),
        nullable=False,
    )

    trigger_field_id = Column(
        Integer,
        ForeignKey("fields.id", ondelete="CASCADE"),
        nullable=False,
    )

    operator = Column(String, nullable=False)

    value = Column(String)

    target_field_id = Column(
        Integer,
        ForeignKey("fields.id", ondelete="CASCADE"),
        nullable=False,
    )

    action = Column(String, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    trigger_field = relationship(
        "Field",
        foreign_keys=[trigger_field_id],
        back_populates="triggered_rules",
    )
    target_field = relationship(
        "Field",
        foreign_keys=[target_field_id],
        back_populates="targeted_rules",
    )