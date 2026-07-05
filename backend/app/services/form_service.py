from sqlalchemy.orm import Session

from app.models.form import Form
from app.models.field import Field
from fastapi import HTTPException
from app.services.field_type_service import get_field_types

def create_form(db: Session, title: str, description: str = None):
    form = Form(
        title=title,
        description=description,
    )

    db.add(form)
    db.commit()
    db.refresh(form)

    return form
def validate_field_config(field_data):
    field_types = get_field_types()

    # Find matching field type
    field_type = next(
        (field for field in field_types if field.type == field_data.type),
        None,
    )

    if field_type is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid field type"
        )

    # Allowed configuration keys
    allowed_configs = {
        config.name
        for config in field_type.config
    }

    # Configuration received from frontend
    received_configs = set(field_data.config.keys())

    # Check for invalid keys
    invalid_configs = received_configs - allowed_configs

    if invalid_configs:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid configuration: {list(invalid_configs)}"
        )

def add_field(db: Session, form_id: int, field_data):

    validate_field_config(field_data)

    field = Field(
        form_id=form_id,
        label=field_data.label,
        type=field_data.type,
        field_order=field_data.field_order,
        config=field_data.config,
    )

    db.add(field)
    db.commit()
    db.refresh(field)

    return field


def get_form(db: Session, form_id: int):
    return db.query(Form).filter(Form.id == form_id).first()