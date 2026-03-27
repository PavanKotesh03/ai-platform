from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.workflow import workflow_service
from app.schemas.workflow import (
    WorkflowListResponse, WorkflowDetailResponse,
    WorkflowResponse, ExecutionRequest, ExecutionResponse,
    SessionResponse, SessionListResponse,
)
from app.core.logging import get_logger
from app.core.database import get_db
logger = get_logger(__name__)

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("/", response_model=WorkflowListResponse)
async def list_workflows():
    try:
        workflows = workflow_service.list_workflows()
        return WorkflowListResponse(
            workflows=[
                WorkflowResponse(
                    id=w.id,
                    name=w.name,
                    description=w.description,
                )
                for w in workflows
            ]
        )
    except Exception as e:
        logger.error(f"Workflow listing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}", response_model=WorkflowDetailResponse)
async def get_workflow(id: str):
    try:
        w = workflow_service.get_workflow(id)
        return WorkflowDetailResponse(id=w.id, name=w.name, description=w.description)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{id}/execute", response_model=ExecutionResponse, status_code=202)
async def execute_workflow(
    id: str,
    request: ExecutionRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await workflow_service.execute_workflow(
            workflow_id=id,
            user_id=request.user_id,
            input_data=request.input,
            db=db,
        )
    except Exception as e:
        logger.error(f"Execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{id}/sessions", response_model=SessionListResponse)
async def get_workflow_sessions(
    id: str,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    try:
        sessions = await workflow_service.get_sessions_by_workflow(
            id, db, limit=limit, offset=offset
        )
        return SessionListResponse(
            sessions=[SessionResponse.model_validate(s) for s in sessions],
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.session_repository import session_repo
    session = await session_repo.get_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return SessionResponse.model_validate(session)