import csv
import io
import json

from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.models.form import Form
from app.models.field import Field
from app.models.response import Response
from app.models.response_value import ResponseValue


def _get_english_str(val, default=""):
    """
    Safely extract a string representation from val, which may be a string,
    a dictionary (e.g. {"en": "Label", "te": "..."}), or a JSON string representation
    of a dictionary. Prefers 'en', falls back to first available non-empty value.
    """
    if val is None:
        return default
    if isinstance(val, dict):
        if "en" in val and val["en"]:
            return str(val["en"])
        for v in val.values():
            if v:
                return str(v)
        return default
    if isinstance(val, str):
        trimmed = val.strip()
        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                parsed = json.loads(val)
                if isinstance(parsed, dict):
                    return _get_english_str(parsed, default)
            except Exception:
                pass
        return val
    return str(val)


def export_form_responses(
    db: Session,
    form_id: int,
    format: str = "csv",
):
    form = (
        db.query(Form)
        .filter(Form.id == form_id)
        .first()
    )
    raw_title = form.title if form else None
    title_str = _get_english_str(raw_title, default=f"form_{form_id}")
    filename = title_str.replace(" ", "_") if title_str else f"form_{form_id}"

    fields = (
        db.query(Field)
        .filter(Field.form_id == form_id)
        .order_by(Field.field_order)
        .all()
    )

    # Fetch all responses
    responses = (
        db.query(Response)
        .filter(Response.form_id == form_id)
        .all()
    )

    export_rows = []

    for response in responses:
        values = (
            db.query(ResponseValue)
            .filter(ResponseValue.response_id == response.id)
            .all()
        )

        value_map = {
            value.field_id: value.value
            for value in values
        }

        row = {}
        for field in fields:
            label_key = _get_english_str(field.label, default=f"Field_{field.id}")
            row[label_key] = value_map.get(field.id, "")

        row["Submitted At"] = (
            str(response.submitted_at)
            if response.submitted_at
            else ""
        )
        row["Response ID"] = response.response_uid

        export_rows.append(row)

    # ---------------- JSON ----------------
    if format.lower() == "json":
        json_data = json.dumps(
            export_rows,
            indent=4,
            default=str,
        )

        return StreamingResponse(
            iter([json_data]),
            media_type="application/json",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}_responses.json"'
                )
            }
        )

    # ---------------- CSV ----------------
    output = io.StringIO()

    if export_rows:
        fieldnames = list(export_rows[0].keys())

        writer = csv.DictWriter(
            output,
            fieldnames=fieldnames,
        )

        writer.writeheader()
        writer.writerows(export_rows)
    else:
        writer = csv.writer(output)
        writer.writerow(["No responses found"])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}_responses.csv"'
            )
        },
    )