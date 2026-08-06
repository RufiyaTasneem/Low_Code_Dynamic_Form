from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.background import BackgroundScheduler

from app.config.database import SessionLocal
from app.models.form import Form
from app.models.response import Response
from app.models.response_value import ResponseValue
from app.models.idempotency import IdempotencyKey


def cleanup_old_responses():
    db = SessionLocal()

    try:
        forms = db.query(Form).all()

        for form in forms:
            if form.retention_days is None:
                continue

            cutoff_date = datetime.now(timezone.utc) - timedelta(days=form.retention_days)

            old_response_ids = [
                response.id
                for response in db.query(Response)
                .filter(
                    Response.form_id == form.id,
                    Response.submitted_at < cutoff_date,
                )
                .all()
            ]

            if not old_response_ids:
                continue

            db.query(ResponseValue).filter(
                ResponseValue.response_id.in_(old_response_ids)
            ).delete(synchronize_session=False)

            db.query(IdempotencyKey).filter(
                IdempotencyKey.response_id.in_(old_response_ids)
            ).delete(synchronize_session=False)

            db.query(Response).filter(
                Response.id.in_(old_response_ids)
            ).delete(synchronize_session=False)

        db.commit()

        print("Retention cleanup completed.")

    except Exception as e:
        print("Retention cleanup failed:", e)
        db.rollback()

    finally:
        db.close()


scheduler = BackgroundScheduler(timezone="UTC")
scheduler.add_job(cleanup_old_responses, "interval", minutes=1)