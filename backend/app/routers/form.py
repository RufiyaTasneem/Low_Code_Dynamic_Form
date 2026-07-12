from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
print(">>> form.py imported <<<")
from app.config.database import SessionLocal
from app.schemas.form import FieldReorder
from app.services.form_service import reorder_fields

from app.schemas.form import (
    FormCreate,
    FormResponse,
    FieldCreate,
    FieldUpdate,
    FieldResponse,
)
from app.services.form_service import (
    create_form,
    add_field,
    get_form,
    update_field,
    delete_field,
    reorder_fields,
    publish_form,
    archive_form,
    create_new_draft,
    get_form_versions,
    get_draft,
    create_new_draft,
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
@router.patch("/{form_id}/fields/reorder")
def reorder_form_fields(
    form_id: int,
    data: FieldReorder,
    db: Session = Depends(get_db),
):
    existing_form = get_form(db, form_id)

    if existing_form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    return reorder_fields(
        db,
        form_id,
        data.field_ids,
    )
@router.patch("/{form_id}/fields/{field_id}", response_model=FieldResponse)
def edit_field(
    form_id: int,
    field_id: int,
    field: FieldUpdate,
    db: Session = Depends(get_db),
):
    existing_form = get_form(db, form_id)

    if existing_form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    return update_field(
        db,
        form_id,
        field_id,
        field,
    )
@router.delete("/{form_id}/fields/{field_id}")
def remove_field(
    form_id: int,
    field_id: int,
    db: Session = Depends(get_db),
):
    existing_form = get_form(db, form_id)

    if existing_form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    return delete_field(
        db,
        form_id,
        field_id,
    )
@router.post("/{form_id}/publish")
def publish_form_api(
    form_id: int,
    db: Session = Depends(get_db),
):
    return publish_form(db, form_id)
@router.post("/{form_id}/archive")
def archive_form_api(
    form_id: int,
    db: Session = Depends(get_db),
):
    return archive_form(db, form_id)
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
@router.get("/{form_id}/versions")
def list_form_versions(
    form_id: int,
    db: Session = Depends(get_db),
):
    return get_form_versions(db, form_id)
@router.get("/{form_id}/versions")
def get_versions(
    form_id: int,
    db: Session = Depends(get_db),
):
    return get_form_versions(
        db,
        form_id,
    )
@router.post("/{form_id}/draft")
def create_new_draft_api(
    form_id: int,
    db: Session = Depends(get_db),
):
    return create_new_draft(
        db,
        form_id,
    )
@router.get("/{form_id}/draft")
def get_draft_api(
    form_id: int,
    db: Session = Depends(get_db),
):
    return get_draft(
        db,
        form_id,
    )