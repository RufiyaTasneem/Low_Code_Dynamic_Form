"""make field label multilingual

Revision ID: c0cf07c55743
Revises: a6fcbea5421e
"""

from typing import Sequence, Union
from alembic import op

revision = "c0cf07c55743"
down_revision = "a6fcbea5421e"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        ALTER TABLE fields
        ALTER COLUMN label
        TYPE JSONB
        USING jsonb_build_object('en', label);
    """)


def downgrade():
    op.execute("""
        ALTER TABLE fields
        ALTER COLUMN label
        TYPE VARCHAR(255)
        USING label->>'en';
    """)