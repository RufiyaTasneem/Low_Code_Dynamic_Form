import secrets

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
            "url": f"http://localhost:3000/f/{existing.token}"
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
    "url": f"http://localhost:3000/f/{token}"
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

    return version.snapshot