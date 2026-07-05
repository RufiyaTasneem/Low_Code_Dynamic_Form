from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
print(">>> form.py imported <<<")
from app.config.database import SessionLocal
from app.schemas.form import (
    FormCreate,
    FormResponse,
    FieldCreate,
    FieldResponse,
)
from app.services.form_service import (
    create_form,
    add_field,
    get_form,
)

router = APIRouter(
    prefix="/forms",
    tags=["Forms"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=FormResponse)
def create_new_form(
    form: FormCreate,
    db: Session = Depends(get_db),
):
    return create_form(
        db,
        form.title,
        form.description,
    )


@router.post("/{form_id}/fields", response_model=FieldResponse)
def create_new_field(
    form_id: int,
    field: FieldCreate,
    db: Session = Depends(get_db),
):
    existing_form = get_form(db, form_id)

    if existing_form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    return add_field(
        db,
        form_id,
        field,
    )


@router.get("/{form_id}", response_model=FormResponse)
def get_form_details(
    form_id: int,
    db: Session = Depends(get_db),
):
    form = get_form(db, form_id)

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    return form