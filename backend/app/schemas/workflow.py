from pydantic import BaseModel, Field
from typing import Any, Optional, List

# Workflow schemas
class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class WorkflowListResponse(BaseModel):
    workflows: List[WorkflowResponse]

class WorkflowDetailResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

# Execution schemas
class ExecutionRequest(BaseModel):
    input: dict[str, Any] = Field(..., description="Input payload for workflow")

class ExecutionResponse(BaseModel):
    workflow_id: str
    workflow_name: str
    status: str
    data: dict[str, Any]