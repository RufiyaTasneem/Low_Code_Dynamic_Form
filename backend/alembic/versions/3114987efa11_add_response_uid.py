"""add response uid

Revision ID: 3114987efa11
Revises: e4c62ffe9c8b
Create Date: 2026-07-26 10:06:28.206794

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3114987efa11'
down_revision: Union[str, Sequence[str], None] = 'e4c62ffe9c8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Step 1: Add column as nullable
    op.add_column(
        "responses",
        sa.Column(
            "response_uid",
            sa.String(length=20),
            nullable=True,
        ),
    )

    # Step 2: Populate existing rows
    connection = op.get_bind()

    import secrets
    from sqlalchemy import text

    rows = connection.execute(
        text("SELECT id FROM responses")
    ).fetchall()

    for row in rows:
        connection.execute(
            text(
                """
                UPDATE responses
                SET response_uid = :uid
                WHERE id = :id
                """
            ),
            {
                "uid": f"resp_{secrets.token_hex(5)}",
                "id": row.id,
            },
        )

    # Step 3: Make column NOT NULL
    op.alter_column(
        "responses",
        "response_uid",
        nullable=False,
    )

    # Step 4: Add unique constraint
    op.create_unique_constraint(
        "uq_response_uid",
        "responses",
        ["response_uid"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_response_uid",
        "responses",
        type_="unique",
    )

    op.drop_column(
        "responses",
        "response_uid",
    )
