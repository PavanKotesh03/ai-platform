from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.workflow import workflow_service
from app.schemas.workflow import WorkflowListResponse, WorkflowResponse, ExecutionRequest, ExecutionResponse
from app.core.dependencies import get_current_user, get_db
from app.core.exceptions import AppException
from app.db.models import User
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("", response_model=WorkflowListResponse)
async def list_workflows(current_user_token: tuple[User, str] = Depends(get_current_user)):
    workflows = workflow_service.list_workflows()
    return WorkflowListResponse(
        workflows=[WorkflowResponse(id=w.id, name=w.name, description=w.description) for w in workflows]
    )


@router.post("/{workflow_id}/execute", response_model=ExecutionResponse)
async def execute_workflow(
    workflow_id: str,
    request: ExecutionRequest,
    current_user_token: tuple[User, str] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user, _ = current_user_token
    try:
        return await workflow_service.execute_workflow(workflow_id, request.input, user.user_id, db)
    except AppException:
        raise
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workflow execution failed",
        )
