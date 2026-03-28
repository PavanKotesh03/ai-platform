from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.workflow import workflow_service
from app.schemas.workflow import WorkflowListResponse, WorkflowResponse, ExecutionRequest, ExecutionResponse
from app.core.dependencies import get_current_user, get_db
from app.db.models import User
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("/", response_model=WorkflowListResponse)
async def list_workflows(current_user_token: tuple = Depends(get_current_user)):
    try:
        workflows = workflow_service.list_workflows()
        return WorkflowListResponse(
            workflows=[WorkflowResponse(id=w.id, name=w.name, description=w.description) for w in workflows]
        )
    except Exception as e:
        logger.error(f"Workflow listing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{id}/execute", response_model=ExecutionResponse)
async def execute_workflow(
    id: str,
    request: ExecutionRequest,
    current_user_token: tuple = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_user_token
    try:
        return await workflow_service.execute_workflow(id, request.input, user.user_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))