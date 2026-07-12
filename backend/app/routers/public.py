from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.services.form_link_service import get_public_form

router = APIRouter(
    prefix="/public",
    tags=["Public"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/forms/{token}")
def public_form(
    token: str,
    db: Session = Depends(get_db),
):
    return get_public_form(db, token)