import copy
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.form import Form
from app.models.field import Field
from app.services.field_type_service import get_field_types
from datetime import datetime

from app.models.form import Form
from app.models.form_version import FormVersion

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

def _build_form_snapshot(db: Session, form_id: int):
    form = db.query(Form).filter(Form.id == form_id).first()

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    fields = (
        db.query(Field)
        .filter(Field.form_id == form_id)
        .order_by(Field.field_order)
        .all()
    )

    return {
        "title": form.title,
        "description": form.description,
        "fields": [
            {
                "label": field.label,
                "type": field.type,
                "field_order": field.field_order,
                "config": field.config,
            }
            for field in fields
        ],
    }


def _get_draft_version(db: Session, form_id: int):
    return (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.status == "Draft",
        )
        .order_by(FormVersion.version.desc())
        .first()
    )


def _get_published_version(db: Session, form_id: int):
    return (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.status == "Published",
        )
        .order_by(FormVersion.version.desc())
        .first()
    )


def _get_latest_version(db: Session, form_id: int):
    return (
        db.query(FormVersion)
        .filter(FormVersion.form_id == form_id)
        .order_by(FormVersion.version.desc())
        .first()
    )


def _create_draft_version(db: Session, form_id: int, allow_empty_snapshot: bool = False):
    existing_draft = _get_draft_version(db, form_id)

    if existing_draft is not None:
        return existing_draft

    latest_version = (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.status.in_(["Published", "Archived"]),
        )
        .order_by(FormVersion.version.desc())
        .first()
    )

    if latest_version is None:
        if not allow_empty_snapshot:
            raise HTTPException(
                status_code=400,
                detail="No published or archived version found",
            )

        snapshot = copy.deepcopy(_build_form_snapshot(db, form_id))
        version_number = 1
    else:
        snapshot = copy.deepcopy(latest_version.snapshot)
        version_number = latest_version.version + 1

    new_version = FormVersion(
        form_id=form_id,
        version=version_number,
        status="Draft",
        snapshot=snapshot,
        published_at=None,
    )

    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return new_version


def _ensure_draft_exists(db: Session, form_id: int):
    draft_version = _get_draft_version(db, form_id)

    if draft_version is None:
        return _create_draft_version(db, form_id, allow_empty_snapshot=True)

    return draft_version


def _update_draft_snapshot(db: Session, form_id: int):
    draft_version = _ensure_draft_exists(db, form_id)
    draft_version.snapshot = copy.deepcopy(_build_form_snapshot(db, form_id))

    return draft_version


def publish_form(db: Session, form_id: int):
    form = db.query(Form).filter(Form.id == form_id).first()

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    draft_version = _get_draft_version(db, form_id)
    published_version = _get_published_version(db, form_id)

    if draft_version is None and published_version is not None:
        raise HTTPException(
            status_code=400,
            detail="Form is already published",
        )

    fields = (
        db.query(Field)
        .filter(Field.form_id == form_id)
        .order_by(Field.field_order)
        .all()
    )

    if not fields:
        raise HTTPException(
            status_code=400,
            detail="Cannot publish without fields",
        )

    if published_version is not None:
        published_version.status = "Archived"

    if draft_version is not None:
        draft_version.status = "Published"
        draft_version.published_at = datetime.utcnow()

        db.commit()
        db.refresh(draft_version)

        return draft_version

    snapshot = copy.deepcopy(_build_form_snapshot(db, form_id))
    latest = _get_latest_version(db, form_id)
    version_number = 1 if latest is None else latest.version + 1

    new_version = FormVersion(
        form_id=form.id,
        version=version_number,
        status="Published",
        snapshot=snapshot,
        published_at=datetime.utcnow(),
    )

    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return new_version

# -----------------------------
# Create Draft From Latest Version
# -----------------------------
def create_new_draft(db: Session, form_id: int):
    form = db.query(Form).filter(Form.id == form_id).first()

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    return _create_draft_version(db, form_id, allow_empty_snapshot=True)
def get_draft(
    db: Session,
    form_id: int,
):
    draft = (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.status == "Draft",
        )
        .order_by(FormVersion.version.desc())
        .first()
    )

    if draft is None:
        raise HTTPException(
            status_code=404,
            detail="Draft not found",
        )

    return draft
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
    _ensure_draft_exists(db, form_id)

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
    db.flush()
    _update_draft_snapshot(db, form_id)
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
    _ensure_draft_exists(db, form_id)

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

    db.flush()
    _update_draft_snapshot(db, form_id)
    db.commit()
    db.refresh(field)

    return field
def delete_field(
    db: Session,
    form_id: int,
    field_id: int,
):
    _ensure_draft_exists(db, form_id)

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
    db.flush()
    _update_draft_snapshot(db, form_id)
    db.commit()

    return {
        "message": "Field deleted successfully"
    }
# -----------------------------
# Reorder Fields
# -----------------------------
def reorder_fields(
    db: Session,
    form_id: int,
    field_ids: list[int],
):
    _ensure_draft_exists(db, form_id)

    fields = (
        db.query(Field)
        .filter(Field.form_id == form_id)
        .all()
    )

    if len(fields) != len(field_ids):
        raise HTTPException(
            status_code=400,
            detail="Invalid field list",
        )

    existing_ids = {field.id for field in fields}

    if set(field_ids) != existing_ids:
        raise HTTPException(
            status_code=400,
            detail="Field IDs do not match",
        )

    for index, field_id in enumerate(field_ids, start=1):
        field = (
            db.query(Field)
            .filter(
                Field.id == field_id,
                Field.form_id == form_id,
            )
            .first()
        )

        field.field_order = index

    db.flush()
    _update_draft_snapshot(db, form_id)
    db.commit()

    return {
        "message": "Fields reordered successfully"
    }
def archive_form(db: Session, form_id: int):
    latest_version = (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.status == "Published",
        )
        .order_by(FormVersion.version.desc())
        .first()
    )

    if latest_version is None:
        raise HTTPException(
            status_code=404,
            detail="No published version found",
        )

    latest_version.status = "Archived"

    db.commit()
    db.refresh(latest_version)

    return latest_version

def get_form_versions(
    db: Session,
    form_id: int,
):
    return (
        db.query(FormVersion)
        .filter(FormVersion.form_id == form_id)
        .order_by(FormVersion.version.desc())
        .all()
    )