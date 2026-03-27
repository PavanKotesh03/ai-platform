from pydantic import BaseModel, Field
from typing import Any, Optional, List


class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


class WorkflowListResponse(BaseModel):
    workflows: List[WorkflowResponse]


class ExecutionRequest(BaseModel):
    input: dict[str, Any] = Field(..., description="Input payload for workflow")


class ExecutionResponse(BaseModel):
    workflow_id: str
    workflow_name: str
    status: str
    data: dict[str, Any]