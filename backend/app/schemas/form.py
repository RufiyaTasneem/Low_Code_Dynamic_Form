from pydantic import BaseModel
from typing import List, Optional, Dict, Any


# -----------------------------
# Field Schemas
# -----------------------------
class FieldCreate(BaseModel):
    label: str
    type: str
    field_order: int
    config: Dict[str, Any]
class FieldUpdate(BaseModel):
    label: str
    config: Dict[str, Any]
class FieldReorder(BaseModel):
    field_ids: List[int]
class FieldResponse(FieldCreate):
    id: int
    form_id: int

    class Config:
        from_attributes = True


# -----------------------------
# Form Schemas
# -----------------------------
class FormCreate(BaseModel):
    title: str
    description: Optional[str] = None


class FormResponse(FormCreate):
    id: int
    fields: List[FieldResponse] = []

    class Config:
        from_attributes = True