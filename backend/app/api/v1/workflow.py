import json
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends, status, Request
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
async def list_workflows(current_user: User = Depends(get_current_user)):  # ← User not tuple
    workflows = workflow_service.list_workflows()
    return WorkflowListResponse(
        workflows=[WorkflowResponse(id=w.id, name=w.name, description=w.description) for w in workflows]
    )


@router.post("/{workflow_id}/execute", response_model=ExecutionResponse)
async def execute_workflow(
    workflow_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    temp_file_path: str | None = None
    content_type = request.headers.get("content-type", "")

    try:
        if "multipart/form-data" in content_type:
            form = await request.form()
            input_payload = json.loads(str(form.get("input", "{}")))

            uploaded_file = form.get("resume_file")
            if uploaded_file and getattr(uploaded_file, "filename", None):
                suffix = Path(uploaded_file.filename).suffix or ".pdf"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                    temp_file.write(await uploaded_file.read())
                    temp_file_path = temp_file.name
                input_payload["resume_path"] = temp_file_path
        else:
            body = await request.json()
            parsed = ExecutionRequest.model_validate(body)
            input_payload = parsed.input

        return await workflow_service.execute_workflow(workflow_id, input_payload, current_user.user_id, db)
    except AppException:
        raise
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workflow execution failed",
        )
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
