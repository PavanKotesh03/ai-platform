from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.repositories.user import UserRepository
from app.db.models import User
from app.core.logging import get_logger

logger = get_logger(__name__)


async def get_db(session: AsyncSession = Depends(get_session)) -> AsyncSession:
    return session


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    # Middleware already verified the token and stored the email
    email: str = request.state.user_email
    user = await UserRepository(db).get_by_email(email)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user                    # ← returns User only, no tuple