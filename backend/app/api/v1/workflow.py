from fastapi import APIRouter, HTTPException
from app.services.workflow import workflow_service
from app.schemas.workflow import (
    WorkflowListResponse, WorkflowDetailResponse,
    WorkflowResponse, ExecutionRequest, ExecutionResponse
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


@router.get("/{id}", response_model=WorkflowDetailResponse)
async def get_workflow(id: str):
    logger.info(f"Fetching workflow: {id}")
    try:
        w = workflow_service.get_workflow(id)
        return WorkflowDetailResponse(id=w.id, name=w.name, description=w.description)
    except Exception as e:
        logger.error(f"Workflow fetch failed: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{id}/execute", response_model=ExecutionResponse, status_code=202)
async def execute_workflow(id: str, request: ExecutionRequest):
    logger.info(f"Executing workflow: {id}")
    try:
        return await workflow_service.execute_workflow(id, request.input)
    except Exception as e:
        logger.error(f"Execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))