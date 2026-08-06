from pydantic import BaseModel
from typing import List


class BulkDeleteRequest(BaseModel):
    response_ids: List[int]