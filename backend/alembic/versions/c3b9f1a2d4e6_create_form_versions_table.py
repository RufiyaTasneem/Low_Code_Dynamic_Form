"""Create form_versions table

Revision ID: c3b9f1a2d4e6
Revises: add66cd109ea
Create Date: 2026-07-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3b9f1a2d4e6'
down_revision: Union[str, Sequence[str], None] = 'add66cd109ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # If a malformed/empty table exists, drop it first (safe when empty)
    op.execute("DROP TABLE IF EXISTS form_versions CASCADE")

    op.create_table(
        'form_versions',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('form_id', sa.Integer(), sa.ForeignKey('forms.id'), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'Draft'")),
        sa.Column('snapshot', sa.JSON(), nullable=False),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index(op.f('ix_form_versions_id'), 'form_versions', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_form_versions_id'), table_name='form_versions')
    op.drop_table('form_versions')
