from fastapi import APIRouter
from app.workflows.registry import workflow_registry
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/status", tags=["Status"])


@router.get("")
async def get_status():
    logger.info("Status check called")
    workflows = workflow_registry.list_workflows()
    return {
        "status": "ok",
        "services": {
            "api": "ok",
            "workflow_registry": {
                "status": "ok",
                "registered_workflows": len(workflows),
                "workflows": [
                    {"id": w.id, "name": w.name} for w in workflows
                ]
            }
        }
    }