from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Workflow
from app.repositories.base import BaseRepository
from typing import Optional


class WorkflowRepository(BaseRepository[Workflow]):
    def __init__(self, session: AsyncSession):
        super().__init__(Workflow, session)
