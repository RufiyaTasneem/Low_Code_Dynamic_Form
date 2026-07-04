from fastapi import APIRouter

from app.services.field_type_service import get_field_types

router = APIRouter(
    prefix="/field-types",
    tags=["Field Types"]
)


@router.get("/")
def get_supported_field_types():
    return get_field_types()