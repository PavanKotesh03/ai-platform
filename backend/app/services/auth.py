from fastapi import HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import UserRepository
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.core.config import settings
from app.db.models import User
from app.core.logging import get_logger

logger = get_logger(__name__)


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth/refresh",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/v1/auth/refresh")


class AuthService:

    async def register(self, username: str, email: str, password: str, db: AsyncSession) -> None:
        repo = UserRepository(db)
        if await repo.get_by_email(email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        if await repo.get_by_username(username):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
        )
        await repo.create(user)
        logger.info(f"User registered: {email}")

    async def login(self, email: str, password: str, response: Response, db: AsyncSession) -> dict:
        user = await UserRepository(db).get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        _set_auth_cookies(response, create_access_token(user.email), create_refresh_token(user.email))
        logger.info(f"User logged in: {email}")
        return {"message": "Login successful"}

    async def refresh(self, request: Request, response: Response, db: AsyncSession) -> dict:
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token cookie missing"
            )
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is invalid or expired"
            )

        user = await UserRepository(db).get_by_email(payload["sub"])
        if not userve:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or deactivated"
            )

        _set_auth_cookies(response, create_access_token(user.email), create_refresh_token(user.email))
        logger.info(f"Tokens rotated for: {user.email}")
        return {"message": "Token refreshed"}

    async def logout(self, response: Response) -> dict:
        _clear_auth_cookies(response)
        logger.info("User logged out")
        return {"message": "Logged out successfully"}


auth_service = AuthService()