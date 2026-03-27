from pydantic import BaseModel, Field, EmailStr
from typing import Any, Optional, List


class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class WorkflowListResponse(BaseModel):
    workflows: List[WorkflowResponse]


class WorkflowDetailResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ExecutionRequest(BaseModel):
    user_id: Optional[str] = None
    input: dict[str, Any] = Field(..., description="Input payload for workflow")


class ExecutionResponse(BaseModel):
    session_id: str 
    workflow_id: str
    workflow_name: str
    status: str
    data: dict[str, Any]


class SessionResponse(BaseModel):
    session_id: str
    user_id: str
    workflow_id: str
    status: str
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    limit: int
    offset: int