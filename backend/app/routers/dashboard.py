from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config.database import SessionLocal
from app.models.form import Form
from app.models.form_version import FormVersion
from app.models.response import Response
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_forms = db.query(Form).filter(Form.owner_id == current_user.id).all()
    user_form_ids = [f.id for f in user_forms]

    total_forms = len(user_forms)
    published_forms = 0
    draft_forms = 0
    archived_forms = 0

    forms_data = []

    for f in user_forms:
        latest_ver = (
            db.query(FormVersion)
            .filter(FormVersion.form_id == f.id)
            .order_by(FormVersion.version.desc())
            .first()
        )
        status = latest_ver.status if latest_ver else "Draft"
        status_lower = status.lower()

        if status_lower == "published":
            published_forms += 1
        elif status_lower == "draft":
            draft_forms += 1
        elif status_lower == "archived":
            archived_forms += 1

        resp_count = (
            db.query(func.count(Response.id))
            .filter(Response.form_id == f.id)
            .scalar()
        )

        updated_val = (
            latest_ver.created_at.isoformat()
            if (latest_ver and latest_ver.created_at)
            else None
        )

        forms_data.append({
            "id": f.id,
            "title": f.title,
            "status": status.capitalize(),
            "responses": resp_count,
            "updated_at": updated_val
        })

    total_responses = (
        db.query(func.count(Response.id))
        .filter(Response.form_id.in_(user_form_ids))
        .scalar()
        if user_form_ids else 0
    )

    recent_responses_raw = (
        db.query(Response)
        .filter(Response.form_id.in_(user_form_ids))
        .order_by(Response.submitted_at.desc())
        .limit(5)
        .all()
        if user_form_ids else []
    )

    recent_responses = []
    for r in recent_responses_raw:
        form_obj = next((f for f in user_forms if f.id == r.form_id), None)
        recent_responses.append({
            "id": r.id,
            "form_id": r.form_id,
            "form_title": form_obj.title if form_obj else "Form",
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            "status": "Completed"
        })

    recent_forms = sorted(forms_data, key=lambda x: x["id"], reverse=True)[:5]

    return {
        "total_forms": total_forms,
        "published_forms": published_forms,
        "draft_forms": draft_forms,
        "archived_forms": archived_forms,
        "total_responses": total_responses,
        "recent_forms": recent_forms,
        "recent_responses": recent_responses,
    }


from datetime import datetime, timedelta

@router.get("/analytics")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_forms = db.query(Form).filter(Form.owner_id == current_user.id).all()
    user_form_ids = [f.id for f in user_forms]

    draft_count = 0
    published_count = 0
    archived_count = 0

    forms_data = []

    for f in user_forms:
        latest_ver = (
            db.query(FormVersion)
            .filter(FormVersion.form_id == f.id)
            .order_by(FormVersion.version.desc())
            .first()
        )
        status = (latest_ver.status if latest_ver else "Draft").lower()
        if status == "published":
            published_count += 1
        elif status == "archived":
            archived_count += 1
        else:
            draft_count += 1

        resp_count = (
            db.query(func.count(Response.id))
            .filter(Response.form_id == f.id)
            .scalar()
        )

        forms_data.append({
            "name": f.title,
            "responses": resp_count or 0
        })

    form_status = {
        "draft": draft_count,
        "published": published_count,
        "archived": archived_count,
    }

    top_forms = sorted(forms_data, key=lambda x: x["responses"], reverse=True)[:5]

    today = datetime.utcnow().date()
    thirty_days_ago = today - timedelta(days=29)

    date_map = {}
    for i in range(30):
        d = thirty_days_ago + timedelta(days=i)
        date_map[d.strftime("%Y-%m-%d")] = 0

    if user_form_ids:
        responses_list = (
            db.query(Response.submitted_at)
            .filter(
                Response.form_id.in_(user_form_ids),
                Response.submitted_at >= datetime.combine(thirty_days_ago, datetime.min.time())
            )
            .all()
        )

        for (sub_at,) in responses_list:
            if sub_at:
                d_str = sub_at.strftime("%Y-%m-%d")
                if d_str in date_map:
                    date_map[d_str] += 1

    responses_over_time = [
        {"date": date_key, "count": date_map[date_key]}
        for date_key in sorted(date_map.keys())
    ]

    return {
        "responses_over_time": responses_over_time,
        "form_status": form_status,
        "top_forms": top_forms,
    }
