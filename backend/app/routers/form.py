from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
print(">>> form.py imported <<<")
from app.config.database import SessionLocal
from app.schemas.form import FieldReorder
from app.services.form_service import reorder_fields
from app.schemas.response import FormSubmission
from app.services.response_service import submit_form
from app.routers.auth import get_current_user
from app.services.analytics_service import get_form_analytics
from fastapi.responses import StreamingResponse, JSONResponse
from app.services.export_service import export_form_responses
from app.models.user import User
from app.services.response_browser_service import get_form_responses as get_form_responses_service
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
    get_version,
    get_user_forms,
)
from app.services.form_link_service import (
    generate_link,
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
    current_user: User = Depends(get_current_user),
):
    
    return create_form(
    db,
    form.title,
    form.description,
    current_user.id,
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
@router.get("/my", response_model=list[FormResponse])
def my_forms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_forms(
        db,
        current_user.id,
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
@router.get("/{form_id}/versions")
def get_versions(
    form_id: int,
    db: Session = Depends(get_db),
):
    return get_form_versions(
        db,
        form_id,
    )


@router.get("/{form_id}/versions/{version_id}")
def get_version_details(
    form_id: int,
    version_id: int,
    db: Session = Depends(get_db),
):
    return get_version(db, form_id, version_id)


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
@router.post("/{form_id}/generate-link")
def generate_shareable_link(
    form_id: int,
    db: Session = Depends(get_db),
):
    return generate_link(db, form_id)
@router.post("/{form_id}/submit")
def submit_form_api(
    form_id: int,
    payload: FormSubmission,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None),
):
    return submit_form(
        db=db,
        form_id=form_id,
        submitted_values=payload.submitted_values,
        idempotency_key=idempotency_key,
    )
@router.get("/{form_id}/analytics")
def analytics(
    form_id: int,
    db: Session = Depends(get_db),
):
    return get_form_analytics(
        db,
        form_id,
    )
@router.get("/{form_id}/responses")
def get_form_responses(
    form_id: int,
    limit: int = 20,
    offset: int = 0,

    search: str | None = None,

    start_date: str | None = None,
    end_date: str | None = None,

    db: Session = Depends(get_db),
):
    return get_form_responses_service(
        db=db,
        form_id=form_id,
        limit=limit,
        offset=offset,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )
@router.get("/{form_id}/export")
def export_form(
    form_id: int,
    format: str = "csv",
    db: Session = Depends(get_db),
):
    return export_form_responses(
        db=db,
        form_id=form_id,
        format=format,
    )