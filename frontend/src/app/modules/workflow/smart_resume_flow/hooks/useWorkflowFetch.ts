import { useEffect, useState } from 'react'
import { workflowService } from '@/app/services/workflow'
import type { Workflow } from '@/app/store/types'

export function useWorkflowFetch(workflowFromLocation: Workflow | null | undefined) {
  const [workflow, setWorkflow] = useState<Workflow | null>(workflowFromLocation ?? null)
  const [workflowLoading, setWorkflowLoading] = useState(!workflowFromLocation)
  const [workflowError, setWorkflowError] = useState('')

  useEffect(() => {
    if (workflowFromLocation) {
      setWorkflow(workflowFromLocation)
      setWorkflowLoading(false)
      setWorkflowError('')
      return
    }

    let cancelled = false
    setWorkflowLoading(true)
    setWorkflowError('')

    workflowService.list()
      .then((res) => {
        if (cancelled) return //If component unmounted → stop
        const fallbackWorkflow = res.data.workflows.find(
          (item) => item.name.toLowerCase() === 'smart_resume_flow',
        )
        if (fallbackWorkflow) {
          setWorkflow(fallbackWorkflow)
          return
        }
        setWorkflow(null)
        setWorkflowError('Smart Resume workflow is unavailable right now.')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const apiError = err as { response?: { data?: { detail?: string } } }
        setWorkflow(null)
        setWorkflowError(
          apiError.response?.data?.detail || 'Unable to load workflow details. Please try again.',
        )
      })
      .finally(() => {
        if (!cancelled) setWorkflowLoading(false)
      })

    return () => { cancelled = true }
  }, [workflowFromLocation])

  return {
    workflow,
    workflowLoading,
    workflowError,
  }
}
