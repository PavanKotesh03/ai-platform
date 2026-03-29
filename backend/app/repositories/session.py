from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import WorkflowSession
from app.repositories.base import BaseRepository


class SessionRepository(BaseRepository[WorkflowSession]):
    def __init__(self, session: AsyncSession):
        super().__init__(WorkflowSession, session)