from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.logging import setup_logging
from app.core.database import init_db, AsyncSessionLocal
from app.core.seeder import seed_workflows

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    async with AsyncSessionLocal() as db:
        await seed_workflows(db)

    yield


app = FastAPI(
    title="Agentic AI Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok"}