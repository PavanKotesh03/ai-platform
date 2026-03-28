from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.logging import setup_logging

setup_logging() 

app = FastAPI(title="Agentic AI Platform", version="1.0.0")
app.include_router(api_router)

@app.get("/health")
async def health():
    return {"status": "ok"}