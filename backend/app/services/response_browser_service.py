from datetime import datetime

from sqlalchemy.orm import Session

from app.models.field import Field
from app.models.response import Response
from app.models.response_value import ResponseValue


def get_form_responses(
    db: Session,
    form_id: int,
    limit: int = 20,
    offset: int = 0,
    search: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    # Base query
    query = (
        db.query(Response)
        .filter(Response.form_id == form_id)
    )

    # Date filters
    if start_date and start_date.strip():
        query = query.filter(
        Response.submitted_at >= datetime.fromisoformat(start_date)
    )

    if end_date and end_date.strip():
        query = query.filter(
        Response.submitted_at <= datetime.fromisoformat(end_date)
    )

    # Total responses after date filters
    total = query.count()

    # Pagination
    responses = (
        query.order_by(Response.submitted_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Fetch form fields
    fields = (
        db.query(Field)
        .filter(Field.form_id == form_id)
        .order_by(Field.field_order)
        .all()
    )

    result = []

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

        row = {
            field.label: value_map.get(field.id, "")
            for field in fields
        }

        # Search filter
        if search:

            found = any(
                search.lower() in str(value).lower()
                for value in row.values()
            )

            if not found:
                continue

        result.append(
            {
                "id": response.id,
                "response_uid": response.response_uid,
                "submitted_at": response.submitted_at,
                "values": row,
            }
        )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "responses": result,
    }