import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.form import Form
from app.models.field import Field
from app.models.response import Response
from app.models.response_value import ResponseValue


def _resolve_title(title_raw) -> str:
    if not title_raw:
        return "Untitled Form"
    if isinstance(title_raw, dict):
        return title_raw.get("en") or (list(title_raw.values())[0] if title_raw.values() else "Untitled Form")
    if isinstance(title_raw, str):
        try:
            parsed = json.loads(title_raw)
            if isinstance(parsed, dict):
                return parsed.get("en") or (list(parsed.values())[0] if parsed.values() else "Untitled Form")
            return title_raw
        except Exception:
            return title_raw
    return str(title_raw)


def get_user_responses(
    db: Session,
    user_id: int,
    form_id: int | None = None,
    limit: int = 50,
    offset: int = 0,
    search: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    # Query Response joined with Form filtered by owner_id
    query = (
        db.query(Response, Form)
        .join(Form, Response.form_id == Form.id)
        .filter(Form.owner_id == user_id)
    )

    if form_id:
        query = query.filter(Response.form_id == form_id)

    # Date filtering
    if start_date and start_date.strip():
        try:
            s_dt = datetime.fromisoformat(start_date.strip())
            query = query.filter(Response.submitted_at >= s_dt)
        except ValueError:
            pass

    if end_date and end_date.strip():
        try:
            e_dt = datetime.fromisoformat(end_date.strip())
            if e_dt.hour == 0 and e_dt.minute == 0 and e_dt.second == 0:
                e_dt = e_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
            query = query.filter(Response.submitted_at <= e_dt)
        except ValueError:
            pass

    # Count total matching query before pagination
    total = query.count()

    results = (
        query.order_by(Response.submitted_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    response_ids = [r.id for r, f in results]
    values_by_response = {}

    if response_ids:
        response_values = (
            db.query(ResponseValue, Field)
            .join(Field, ResponseValue.field_id == Field.id)
            .filter(ResponseValue.response_id.in_(response_ids))
            .all()
        )
        for rv, f in response_values:
            if rv.response_id not in values_by_response:
                values_by_response[rv.response_id] = {}
            f_lbl = _resolve_title(f.label)
            values_by_response[rv.response_id][f_lbl] = rv.value

    result = []
    for response, form in results:
        f_title = _resolve_title(form.title)
        val_map = values_by_response.get(response.id, {})

        # Search filter across form_title, response_uid, or response values
        if search and search.strip():
            term = search.strip().lower()
            title_match = term in f_title.lower()
            uid_match = term in (response.response_uid or "").lower()
            val_match = any(term in str(v).lower() for v in val_map.values())
            if not (title_match or uid_match or val_match):
                continue

        result.append(
            {
                "id": response.id,
                "response_uid": response.response_uid,
                "form_id": form.id,
                "form_title": f_title,
                "submitted_at": response.submitted_at.isoformat() if response.submitted_at else None,
                "values": val_map,
            }
        )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "responses": result,
    }


def get_form_responses(
    db: Session,
    form_id: int,
    limit: int = 20,
    offset: int = 0,
    search: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    # Backward compatibility wrapper
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        return {"total": 0, "limit": limit, "offset": offset, "responses": []}
    return get_user_responses(
        db=db,
        user_id=form.owner_id,
        form_id=form_id,
        limit=limit,
        offset=offset,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )