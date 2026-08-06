from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.form import Form

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db),
):

    logs = (
        db.query(AuditLog, User, Form)
        .join(User, AuditLog.user_id == User.id)
        .outerjoin(Form, AuditLog.form_id == Form.id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    return [
        {
            "id": log.id,
            "user": user.email,
            "action": log.action,
            "form": form.title if form else "-",
            "details": log.details,
            "date": log.created_at.strftime("%d-%m-%Y %H:%M"),
        }
        for log, user, form in logs
    ]