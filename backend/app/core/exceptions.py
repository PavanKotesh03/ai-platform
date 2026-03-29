from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from app.core.logging import get_logger

logger = get_logger(__name__)


class AppException(Exception):
    """Base class for all application-level exceptions that map to HTTP responses."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class DatabaseException(AppException):
    """Raised when a database operation fails unexpectedly."""

    def __init__(self, detail: str = "A database error occurred"):
        super().__init__(status_code=500, detail=detail)


class WorkflowNotFoundException(AppException):
    """Raised when a requested workflow ID does not exist in the registry."""

    def __init__(self, workflow_id: str):
        super().__init__(
            status_code=404,
            detail=f"Workflow '{workflow_id}' not found",
        )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception(
            "Unhandled exception",
            method=request.method,
            path=request.url.path,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )