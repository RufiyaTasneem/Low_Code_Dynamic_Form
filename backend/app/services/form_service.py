import copy
import json
import logging
from sqlalchemy import or_, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.form import Form
from app.models.field import Field
from app.models.response import Response
from app.models.response_value import ResponseValue
from app.models.conditional_rule import ConditionalRule
from app.models.form_link import FormLink
from app.models.audit_log import AuditLog
from app.models.idempotency import IdempotencyKey
from app.services.field_type_service import get_field_types
from app.services.audit_service import log_action
from datetime import datetime
from app.models.form_version import FormVersion

logger = logging.getLogger(__name__)

# -----------------------------
# Create Form
# -----------------------------
def create_form(
    db: Session,
    title: str,
    description: str = None,
    owner_id: int = None,
):
    form = Form(
    title=title,
    description=description,
    owner_id=owner_id,
)

    db.add(form)
    db.commit()
    db.refresh(form)

    return form
def get_user_forms(db: Session, user_id: int):
    forms = (
        db.query(Form)
        .filter(Form.owner_id == user_id)
        .order_by(Form.id.desc())
        .all()
    )

    if not forms:
        return []

    form_ids = [f.id for f in forms]

    subq = (
        db.query(
            FormVersion.form_id,
            func.max(FormVersion.version).label("max_version"),
        )
        .filter(FormVersion.form_id.in_(form_ids))
        .group_by(FormVersion.form_id)
        .subquery()
    )

    latest_versions = (
        db.query(FormVersion)
        .join(
            subq,
            (FormVersion.form_id == subq.c.form_id)
            & (FormVersion.version == subq.c.max_version),
        )
        .all()
    )

    version_map = {v.form_id: v for v in latest_versions}

    for form in forms:
        ver_obj = version_map.get(form.id)
        form.version = ver_obj.version if ver_obj else 1
        form.status = ver_obj.status.lower() if (ver_obj and ver_obj.status) else "draft"

    return forms

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
                "id": field.id,
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

    field_type = next(
        (field for field in field_types if field.type == field_type_name),
        None,
    )

    if field_type is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid field type",
        )

    allowed_configs = {
        cfg.name
        for cfg in field_type.config
    }

    received_configs = set(config.keys())

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
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        return None

    latest_ver = (
        db.query(FormVersion)
        .filter(FormVersion.form_id == form_id)
        .order_by(FormVersion.version.desc())
        .first()
    )

    form.version = latest_ver.version if latest_ver else 1
    form.status = latest_ver.status.lower() if (latest_ver and latest_ver.status) else "draft"
    return form


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

    try:
        # Remove dependent response values first, if any exist.
        db.query(ResponseValue).filter(ResponseValue.field_id == field_id).delete(synchronize_session=False)

        # Remove any conditional rules that target or trigger this field.
        db.query(ConditionalRule).filter(
            or_(
                ConditionalRule.trigger_field_id == field_id,
                ConditionalRule.target_field_id == field_id,
            )
        ).delete(synchronize_session=False)

        db.delete(field)
        db.flush()
        _update_draft_snapshot(db, form_id)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception(
            "Failed to delete field %s for form %s: %s",
            field_id,
            form_id,
            exc,
        )
        raise HTTPException(
            status_code=400,
            detail=f"Failed to delete field: {str(exc)}",
        )

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
def get_version(db: Session, form_id: int, version_id: int):
    version = (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.id == version_id,
        )
        .first()
    )

    if version is None:
        raise HTTPException(
            status_code=404,
            detail="Version not found",
        )
    return version.snapshot
def duplicate_form(
    db: Session,
    form_id: int,
    owner_id: int,
):
    original_form = (
    db.query(Form)
    .filter(Form.id == form_id)
    .first()
)
    if not original_form:
        raise Exception("Form not found")
    new_form = Form(
    title=f"{original_form.title} (Copy)",
    description=original_form.description,
    owner_id=owner_id,
)
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    field_mapping = {}

    for field in original_form.fields:

        new_field = Field(
            form_id=new_form.id,
            label=field.label,
            type=field.type,
            field_order=field.field_order,
            config=field.config,
        )

        db.add(new_field)
        db.flush()

        field_mapping[field.id] = new_field.id

    db.commit()
    db.refresh(new_form)
    return new_form
def update_retention_policy(
    db: Session,
    form_id: int,
    retention_days: int,
):
    form = (
        db.query(Form)
        .filter(Form.id == form_id)
        .first()
    )

    if not form:
        raise Exception("Form not found")

    form.retention_days = retention_days

    db.commit()
    db.refresh(form)

    return form


def delete_form_service(
    db: Session,
    form_id: int,
    user_id: int,
):
    form = (
        db.query(Form)
        .filter(Form.id == form_id, Form.owner_id == user_id)
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found or permission denied",
        )

    try:
        # Extract clean title string for audit log
        title_raw = form.title
        form_title = "Untitled Form"
        if isinstance(title_raw, dict):
            form_title = title_raw.get("en") or (list(title_raw.values())[0] if title_raw.values() else f"Form #{form_id}")
        elif isinstance(title_raw, str):
            try:
                parsed = json.loads(title_raw)
                if isinstance(parsed, dict):
                    form_title = parsed.get("en") or (list(parsed.values())[0] if parsed.values() else f"Form #{form_id}")
                else:
                    form_title = title_raw
            except Exception:
                form_title = title_raw
        else:
            form_title = str(title_raw)

        # 1. Fetch all response IDs for this form
        responses = db.query(Response.id).filter(Response.form_id == form_id).all()
        response_ids = [r.id for r in responses]

        if response_ids:
            # Delete idempotency keys referencing those responses first
            db.query(IdempotencyKey).filter(
                IdempotencyKey.response_id.in_(response_ids)
            ).delete(synchronize_session=False)

            # Delete response values
            db.query(ResponseValue).filter(
                ResponseValue.response_id.in_(response_ids)
            ).delete(synchronize_session=False)

            # Delete response records
            db.query(Response).filter(
                Response.form_id == form_id
            ).delete(synchronize_session=False)

        # 2. Delete conditional rules
        db.query(ConditionalRule).filter(
            ConditionalRule.form_id == form_id
        ).delete(synchronize_session=False)

        # 3. Delete form links
        db.query(FormLink).filter(
            FormLink.form_id == form_id
        ).delete(synchronize_session=False)

        # 4. Decouple existing audit logs for this form so FK does not break
        db.query(AuditLog).filter(
            AuditLog.form_id == form_id
        ).update({"form_id": None}, synchronize_session=False)

        # 5. Delete the form (fields and form_versions will cascade delete)
        db.delete(form)

        # 6. Record Audit Log for DELETE_FORM
        log_action(
            db=db,
            user_id=user_id,
            form_id=None,
            action="DELETE_FORM",
            details=f'Deleted form "{form_title}"',
        )

        db.commit()
        return {"message": "Form deleted successfully", "form_id": form_id}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete form {form_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete form: {str(e)}"
        )