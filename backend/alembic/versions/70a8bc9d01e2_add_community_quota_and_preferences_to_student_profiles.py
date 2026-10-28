"""add_community_quota_and_preferences_to_student_profiles

Revision ID: 70a8bc9d01e2
Revises: 6994aabdebb7
Create Date: 2026-10-28 07:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '70a8bc9d01e2'
down_revision: Union[str, None] = '6994aabdebb7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = [c['name'] for c in insp.get_columns('student_profiles')]

    if 'community' not in cols:
        op.add_column('student_profiles', sa.Column('community', sa.String(length=50), nullable=True))
    if 'is_first_graduate' not in cols:
        op.add_column('student_profiles', sa.Column('is_first_graduate', sa.Boolean(), nullable=True))
    if 'is_govt_school' not in cols:
        op.add_column('student_profiles', sa.Column('is_govt_school', sa.Boolean(), nullable=True))
    if 'website_preferences' not in cols:
        op.add_column('student_profiles', sa.Column('website_preferences', sa.JSON(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = [c['name'] for c in insp.get_columns('student_profiles')]

    for col in ['website_preferences', 'is_govt_school', 'is_first_graduate', 'community']:
        if col in cols:
            op.drop_column('student_profiles', col)
