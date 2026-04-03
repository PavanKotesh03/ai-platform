from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, MessageResponse, UserResponse
from app.services.auth import auth_service
from app.db.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=MessageResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.register(body.username, body.email, body.password, db)
    return MessageResponse(message="User registered successfully")


@router.post("/login", response_model=MessageResponse)
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(body.email, body.password, response, db)


@router.post("/refresh", response_model=MessageResponse)
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh(request, response, db)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),   # ← User not tuple
):
    return await auth_service.logout(response, current_user.user_id)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):  # ← User not tuple
    return current_user