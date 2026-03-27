from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.session import Session, SessionStatus
from app.core.logging import get_logger

logger = get_logger(__name__)


class SessionRepository:

    async def create(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        workflow_id: str,
    ) -> Session:
        session = Session(
            user_id=user_id,
            workflow_id=workflow_id,
            status=SessionStatus.PENDING,
        )
        db.add(session)
        await db.flush()
        logger.info(
            f"Session created: id={session.session_id} "
            f"user={user_id} workflow={workflow_id}"
        )
        return session

    async def mark_running(
        self, db: AsyncSession, session: Session
    ) -> Session:
        session.status = SessionStatus.RUNNING
        await db.flush()
        logger.info(f"Session running: id={session.session_id}")
        return session

    async def mark_success(
        self, db: AsyncSession, session: Session
    ) -> Session:
        session.status = SessionStatus.SUCCESS
        await db.flush()
        logger.info(f"Session succeeded: id={session.session_id}")
        return session

    async def mark_failed(
        self,
        db: AsyncSession,
        session: Session,
        error_message: str,
    ) -> Session:
        session.status = SessionStatus.FAILED
        session.error_message = error_message
        await db.flush()
        logger.warning(
            f"Session failed: id={session.session_id} error={error_message}"
        )
        return session

    async def get_by_id(
        self, db: AsyncSession, session_id: str
    ) -> Session | None:
        result = await db.execute(
            select(Session).where(Session.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Session]:
        limit = min(limit, 100)
        result = await db.execute(
            select(Session)
            .where(Session.user_id == user_id)
            .order_by(desc(Session.session_id))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def list_by_workflow(
        self,
        db: AsyncSession,
        workflow_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Session]:
        limit = min(limit, 100)
        result = await db.execute(
            select(Session)
            .where(Session.workflow_id == workflow_id)
            .order_by(desc(Session.session_id))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())


session_repo = SessionRepository()