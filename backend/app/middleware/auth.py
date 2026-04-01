from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.core.security import decode_token
from app.core.logging import get_logger

logger = get_logger(__name__)

# These paths bypass authentication entirely
PUBLIC_PATHS = {
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        # 1. Skip auth for public routes
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        # 2. Extract access_token from HttpOnly cookie
        token = request.cookies.get("access_token")
        if not token:
            logger.warning(
                "Blocked unauthenticated request",
                path=request.url.path,
                method=request.method,
            )
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated — access_token cookie missing"},
            )

        # 3. Decode and validate JWT
        try:
            payload = decode_token(token)
        except ValueError:
            logger.warning(
                "Blocked request with invalid/expired token",
                path=request.url.path,
            )
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )

        # 4. Ensure it's an access token, not a refresh token
        if payload.get("type") != "access":
            logger.warning(
                "Blocked request — wrong token type",
                path=request.url.path,
                token_type=payload.get("type"),
            )
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token type"},
            )

        # 5. Attach user email to request state — available in all routes
        #    Access it in any route via: request.state.user_email
        request.state.user_email = payload["sub"]

        logger.debug(
            "Authenticated request passed",
            path=request.url.path,
            user_email=payload["sub"],
        )

        return await call_next(request)