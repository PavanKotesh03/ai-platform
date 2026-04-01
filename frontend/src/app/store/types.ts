export interface User {
  user_id: string
  username: string
  email: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface Workflow {
  id: string
  name: string
  description?: string
}

export interface WorkflowListResponse {
  workflows: Workflow[]
}

export interface ExecutionRequest {
  input: Record<string, unknown>
}

export interface ExecutionResponse {
  workflow_id: string
  workflow_name: string
  status: string
  data: Record<string, unknown>
}