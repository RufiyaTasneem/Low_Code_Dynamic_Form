"""add owner_id to forms

Revision ID: e4c62ffe9c8b
Revises: f1229e3c6df0
Create Date: 2026-07-23 15:49:12.372072

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4c62ffe9c8b'
down_revision: Union[str, Sequence[str], None] = 'f1229e3c6df0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Add owner_id as nullable
    op.add_column(
        "forms",
        sa.Column("owner_id", sa.Integer(), nullable=True)
    )

    # Step 2: Assign existing forms to user id = 3
    op.execute("""
        UPDATE forms
        SET owner_id = 3
        WHERE owner_id IS NULL
    """)

    # Step 3: Make owner_id NOT NULL
    op.alter_column(
        "forms",
        "owner_id",
        nullable=False
    )

    # Step 4: Add foreign key
    op.create_foreign_key(
        "fk_forms_owner_id_users",
        "forms",
        "users",
        ["owner_id"],
        ["id"]
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_forms_owner_id_users",
        "forms",
        type_="foreignkey"
    )

    op.drop_column("forms", "owner_id")
