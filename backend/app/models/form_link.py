from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.config.database import Base

class FormLink(Base):
    __tablename__ = "form_links"

    id = Column(Integer, primary_key=True, index=True)

    form_id = Column(Integer, ForeignKey("forms.id"))
    form_version_id = Column(Integer, ForeignKey("form_versions.id"))

    token = Column(String(100), unique=True, nullable=False)

    form = relationship("Form")
    version = relationship("FormVersion")