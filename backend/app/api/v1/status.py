from fastapi import APIRouter, Depends
from app.workflows.registry import workflow_registry
from app.core.dependencies import get_current_user
from app.db.models import User
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/status", tags=["Status"])


@router.get("")
async def get_status(current_user: User = Depends(get_current_user)):
    logger.debug("Status check called")
    workflows = workflow_registry.list_workflows()
    return {
        "status": "ok",
        "services": {
            "api": "ok",
            "workflow_registry": {
                "status": "ok",
                "registered_workflows": len(workflows),
                "workflows": [{"id": w.id, "name": w.name} for w in workflows],
            },
        },
    }