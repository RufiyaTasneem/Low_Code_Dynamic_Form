from pydantic import BaseModel
from typing import Optional


class ConditionalRuleCreate(BaseModel):
    trigger_field_id: int
    operator: str
    value: Optional[str] = None
    target_field_id: int
    action: str


class ConditionalRuleResponse(BaseModel):
    id: int
    form_id: int
    trigger_field_id: int
    operator: str
    value: Optional[str]
    target_field_id: int
    action: str

    class Config:
        from_attributes = True


# -------------------------
# NEW (Add this)
# -------------------------

class RuleEvaluationRequest(BaseModel):
    values: dict[str, str]