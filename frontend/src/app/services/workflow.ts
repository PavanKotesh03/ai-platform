import client from './client'
import type { WorkflowListResponse, ExecutionRequest, ExecutionResponse } from '@/app/store/types'

export const workflowService = {
  list: () =>
    client.get<WorkflowListResponse>('/api/v1/workflows'),

  execute: (workflowId: string, data: ExecutionRequest) =>
    client.post<ExecutionResponse>(`/api/v1/workflows/${workflowId}/execute`, data),
}