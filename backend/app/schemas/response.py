from pydantic import BaseModel
from typing import Dict, Any, Optional
from typing import List

class BulkDeleteRequest(BaseModel):
    response_ids: List[int]

class FormSubmission(BaseModel):
    submitted_values: Dict[str, Any]


class SubmissionResponse(BaseModel):
    message: str