from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.form import Form
from app.models.field import Field
from app.services.field_type_service import get_field_types


# -----------------------------
# Create Form
# -----------------------------
def create_form(db: Session, title: str, description: str = None):
    form = Form(
        title=title,
        description=description,
    )

    db.add(form)
    db.commit()
    db.refresh(form)

    return form


# -----------------------------
# Validate Field Configuration
# -----------------------------
def validate_field_config(field_type_name, config):
    field_types = get_field_types()

    # Find matching field type
    field_type = next(
        (field for field in field_types if field.type == field_type_name),
        None,
    )

    if field_type is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid field type",
        )

    # Allowed configuration keys
    allowed_configs = {
        cfg.name
        for cfg in field_type.config
    }

    # Received configuration keys
    received_configs = set(config.keys())

    # Invalid keys
    invalid_configs = received_configs - allowed_configs

    if invalid_configs:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid configuration: {list(invalid_configs)}",
        )


# -----------------------------
# Add Field
# -----------------------------
def add_field(db: Session, form_id: int, field_data):

    validate_field_config(
        field_data.type,
        field_data.config,
    )

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


# -----------------------------
# Get Form
# -----------------------------
def get_form(db: Session, form_id: int):
    return db.query(Form).filter(Form.id == form_id).first()


# -----------------------------
# Update Field
# -----------------------------
def update_field(
    db: Session,
    form_id: int,
    field_id: int,
    field_data,
):
    field = (
        db.query(Field)
        .filter(
            Field.id == field_id,
            Field.form_id == form_id,
        )
        .first()
    )

    if field is None:
        raise HTTPException(
            status_code=404,
            detail="Field not found",
        )

    # Validate updated configuration
    validate_field_config(
        field.type,
        field_data.config,
    )

    field.label = field_data.label
    field.config = field_data.config

    db.commit()
    db.refresh(field)

    return field
def delete_field(
    db: Session,
    form_id: int,
    field_id: int,
):
    field = (
        db.query(Field)
        .filter(
            Field.id == field_id,
            Field.form_id == form_id,
        )
        .first()
    )

    if field is None:
        raise HTTPException(
            status_code=404,
            detail="Field not found",
        )

    db.delete(field)
    db.commit()

    return {
        "message": "Field deleted successfully"
    }