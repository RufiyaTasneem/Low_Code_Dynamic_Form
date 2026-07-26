from pydantic import BaseModel
from typing import Dict, Any


class RuleEvaluationRequest(BaseModel):
    submitted_values: Dict[str, Any]