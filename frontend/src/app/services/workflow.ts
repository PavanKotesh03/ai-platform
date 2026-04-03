import client from './client'
import type { WorkflowListResponse, ExecutionRequest, ExecutionResponse } from '@/app/store/types'

export const workflowService = {
  list: () =>
    client.get<WorkflowListResponse>('/api/v1/workflows'),

  execute: (workflowId: string, data: ExecutionRequest) =>
    client.post<ExecutionResponse>(`/api/v1/workflows/${workflowId}/execute`, data),

  executeWithPdf: (
    workflowId: string,
    input: Record<string, unknown>,
    file: File,
  ) => {
    const formData = new FormData()
    formData.append('input', JSON.stringify(input))
    formData.append('resume_file', file)

    return client.post<ExecutionResponse>(
      `/api/v1/workflows/${workflowId}/execute`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
  },
}
