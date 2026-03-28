from fastapi import APIRouter, HTTPException
from app.services.workflow import workflow_service
from app.schemas.workflow import (
    WorkflowListResponse, WorkflowResponse,
    ExecutionRequest, ExecutionResponse
)
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("/", response_model=WorkflowListResponse)
async def list_workflows():
    logger.info("Listing workflows")
    try:
        workflows = workflow_service.list_workflows()
        return WorkflowListResponse(
            workflows=[WorkflowResponse(id=w.id, name=w.name, description=w.description) for w in workflows]
        )
    except Exception as e:
        logger.error(f"Workflow listing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/{id}/execute", response_model=ExecutionResponse)
async def execute_workflow(id: str, request: ExecutionRequest):
    logger.info(f"Executing workflow: {id}")
    try:
        return await workflow_service.execute_workflow(id, request.input)
    except Exception as e:
        logger.error(f"Execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))