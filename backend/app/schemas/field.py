from pydantic import BaseModel
from typing import List


class ConfigProperty(BaseModel):
    name: str
    type: str
    label: str


class FieldType(BaseModel):
    type: str
    label: str
    config: List[ConfigProperty]