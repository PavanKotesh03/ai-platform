from fastapi import APIRouter
from app.api.v1.workflow import router as workflow_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(workflow_router)