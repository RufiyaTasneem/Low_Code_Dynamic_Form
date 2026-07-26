import secrets
import token

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.form_link import FormLink
from app.models.form_version import FormVersion


def generate_link(db: Session, form_id: int):
    published = (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.status == "Published",
        )
        .order_by(FormVersion.version.desc())
        .first()
    )

    if published is None:
        raise HTTPException(
            status_code=400,
            detail="Publish the form before generating a link.",
        )

    existing = (
        db.query(FormLink)
        .filter(FormLink.form_version_id == published.id)
        .first()
    )

    if existing:
        return {
    "url": f"http://localhost:3000/form/{existing.token}"
}

    token = secrets.token_urlsafe(16)

    link = FormLink(
        form_id=form_id,
        form_version_id=published.id,
        token=token,
    )

    db.add(link)
    db.commit()
    db.refresh(link)
    return {
    "url": f"http://localhost:3000/form/{token}"
}


def get_public_form(db: Session, token: str):
    link = (
        db.query(FormLink)
        .filter(FormLink.token == token)
        .first()
    )

    if link is None:
        raise HTTPException(
            status_code=404,
            detail="Invalid link",
        )

    version = (
        db.query(FormVersion)
        .filter(FormVersion.id == link.form_version_id)
        .first()
    )
    # Ensure snapshot includes form id and field ids. Some older snapshots
    # may be missing `id` for fields — fill them from the current DB state
    snapshot = version.snapshot or {}

    # Ensure top-level form id is present
    if "id" not in snapshot:
        snapshot["id"] = version.form_id

    fields = snapshot.get("fields", [])

    # If any field is missing an id, try to map by field_order to current fields
    missing_id_indexes = [i for i, f in enumerate(fields) if "id" not in f]
    if missing_id_indexes:
        # Fallback: query Field table directly for same form_id
        from app.models.field import Field

        db_fields = (
            db.query(Field)
            .filter(Field.form_id == version.form_id)
            .order_by(Field.field_order)
            .all()
        )

        for idx in missing_id_indexes:
            snap_field = fields[idx]
            # try match by field_order first
            fo = snap_field.get("field_order")
            matched = None
            if fo is not None:
                for f in db_fields:
                    if f.field_order == fo:
                        matched = f
                        break

            # otherwise, try by label+type
            if matched is None:
                for f in db_fields:
                    if f.label == snap_field.get("label") and f.type == snap_field.get("type"):
                        matched = f
                        break

            if matched is not None:
                snap_field["id"] = matched.id

    snapshot["fields"] = fields

    return snapshot