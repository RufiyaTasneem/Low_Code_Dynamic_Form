from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.field import Field
from app.models.form import Form
from app.models.idempotency import IdempotencyKey
from app.models.response import Response
from app.models.response_value import ResponseValue
from app.services.rule_evaluator import evaluate_form_rules
from app.services.validation_service import validate_field


def submit_form(
    db: Session,
    form_id: int,
    submitted_values: dict,
    idempotency_key: str | None = None,
):
    form = db.query(Form).filter(Form.id == form_id).first()

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    submitted_values = submitted_values or {}

    if idempotency_key:
        existing = (
            db.query(IdempotencyKey)
            .filter(IdempotencyKey.key == idempotency_key)
            .first()
        )

        if existing:
            previous_response = existing.response
            return {
                "success": True,
                "message": "Duplicate submission prevented",
                "response_id": previous_response.response_uid,
                "submitted_at": previous_response.submitted_at,
                "form_title": form.title,
            }

    fields = db.query(Field).filter(Field.form_id == form_id).all()
    field_states = evaluate_form_rules(db, form_id, submitted_values)

    validation_errors = {}

    for field in fields:
        value = submitted_values.get(str(field.id), submitted_values.get(field.id))
        state = field_states.get(field.id, field_states.get(str(field.id)))

        if state and not state["visible"]:
            if value not in (None, "", {}):
                validation_errors[str(field.id)] = [
                    f"{field.label} is hidden and cannot be submitted."
                ]
            continue

        if state and state["required"]:
            if value in (None, "", {}):
                validation_errors[str(field.id)] = [
                    f"{field.label} is required."
                ]
                continue

        errors = validate_field(field, value)

        if errors:
            validation_errors[str(field.id)] = errors

    if validation_errors:
        raise HTTPException(
            status_code=400,
            detail={"errors": validation_errors},
        )

    response = Response(form_id=form_id)
    db.add(response)
    db.commit()
    db.refresh(response)

    for field in fields:
        state = field_states.get(field.id, field_states.get(str(field.id)))

        if state and not state["visible"]:
            continue

        value = submitted_values.get(str(field.id), submitted_values.get(field.id))

        if value in (None, "", {}):
            continue

        response_value = ResponseValue(
            response_id=response.id,
            field_id=field.id,
            value=str(value),
        )
        db.add(response_value)

    if idempotency_key:
        db.add(
            IdempotencyKey(
                key=idempotency_key,
                response_id=response.id,
            )
        )

    db.commit()
    return {
        "success": True,
        "message": "Response submitted successfully",
        "response_id": response.response_uid,
        "submitted_at": response.submitted_at,
        "form_title": form.title,
    }
