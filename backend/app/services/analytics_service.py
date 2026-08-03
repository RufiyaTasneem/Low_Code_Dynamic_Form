from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.response import Response
from app.models.field import Field
from app.models.response_value import ResponseValue


def get_form_analytics(
    db: Session,
    form_id: int,
):
    total_submissions = (
        db.query(func.count(Response.id))
        .filter(Response.form_id == form_id)
        .scalar()
    )

    total_fields = (
        db.query(func.count(Field.id))
        .filter(Field.form_id == form_id)
        .scalar()
    )

    # Per-field distributions
    field_distributions = []

    fields = (
        db.query(Field)
        .filter(Field.form_id == form_id)
        .all()
    )

    for field in fields:

        # Only chart dropdowns and ratings
        if field.type not in ["dropdown", "rating"]:
            continue

        values = (
    db.query(
        ResponseValue.value,
        func.count(ResponseValue.id)
    )
    .join(
        Response,
        Response.id == ResponseValue.response_id
    )
    .filter(
        Response.form_id == form_id,
        ResponseValue.field_id == field.id,
    )
    .group_by(ResponseValue.value)
    .all()
)

        distribution = {
            value: count
            for value, count in values
        }

        field_distributions.append({
    "field_id": field.id,
    "label": field.label,
    "type": field.type,
    "distribution": distribution,
})

    return {
    "total_submissions": total_submissions,
    "completion_rate": 100,
    "average_completion_time": 0,
    "total_fields": total_fields,
    "field_distributions": field_distributions,
}