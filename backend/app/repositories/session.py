from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Session
from app.repositories.base import BaseRepository


class SessionRepository(BaseRepository[Session]):
    def __init__(self, session: AsyncSession):
        super().__init__(Session, session)