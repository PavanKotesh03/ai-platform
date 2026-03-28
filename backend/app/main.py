from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.logging import setup_logging, get_logger
from app.core.startup import create_tables, sync_workflows
from app.db.session import engine

setup_logging()
logger = get_logger(__name__)

app = FastAPI(title="Agentic AI Platform", version="1.0.0")
app.include_router(api_router)


@app.on_event("startup")
async def startup():
    logger.info("Starting up...")
    await create_tables()
    await sync_workflows()
    logger.info("Application ready")


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down...")
    await engine.dispose()
    logger.info("Database connections closed")


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}