from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.logging import setup_logging, get_logger
from app.core.startup import create_tables, sync_workflows
from app.core.exceptions import register_exception_handlers
from app.workflows.loader import register_workflows
from app.db.session import engine

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    register_workflows()
    await create_tables()
    await sync_workflows()
    logger.info("Application ready")
    yield
    logger.info("Shutting down...")
    await engine.dispose()
    logger.info("Database connections closed")


app = FastAPI(title="Agentic AI Platform", version="1.0.0", lifespan=lifespan)
register_exception_handlers(app)
app.include_router(api_router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}