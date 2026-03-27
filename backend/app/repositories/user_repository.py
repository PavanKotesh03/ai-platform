from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.logging import get_logger

logger = get_logger(__name__)


class UserRepository:

    async def create(
        self,
        db: AsyncSession,
        *,
        name: str,
        email: str,
        hashed_password: str,
    ) -> User:
        user = User(
            name=name,
            email=email,
            hashed_password=hashed_password,
            is_active=True,
        )
        db.add(user)
        await db.flush()
        logger.info(f"User created: id={user.user_id} email={email}")
        return user

    async def get_by_id(self, db: AsyncSession, user_id: str) -> User | None:
        result = await db.execute(
            select(User).where(User.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def set_active(
        self, db: AsyncSession, user: User, is_active: bool
    ) -> User:
        user.is_active = is_active
        await db.flush()
        logger.info(f"User active={is_active}: id={user.user_id}")
        return user


user_repo = UserRepository()