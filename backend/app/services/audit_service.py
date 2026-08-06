from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    user_id: int,
    form_id: int,
    action: str,
    details: str = ""
):
    log = AuditLog(
        user_id=user_id,
        form_id=form_id,
        action=action,
        details=details,
    )

    db.add(log)
    db.commit()