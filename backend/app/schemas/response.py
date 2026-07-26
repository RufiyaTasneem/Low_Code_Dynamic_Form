from pydantic import BaseModel
from typing import Dict, Any


class FormSubmission(BaseModel):
    submitted_values: Dict[str, Any]


class SubmissionResponse(BaseModel):
    message: str