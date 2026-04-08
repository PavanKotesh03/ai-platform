import { useEffect, useState } from 'react'
import { workflowService } from '@/app/services/workflow'
import type { ExecutionResponse, Workflow } from '@/app/store/types'

export type ApprovalDecision = 'approve' | 'reject'

export function useDecisionHandler(
  workflow: Workflow | null,
  resumeFile: File | null,
  result: ExecutionResponse | null,
  onDecisionComplete: (decision: ApprovalDecision, updatedResult?: ExecutionResponse) => void,
) {
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision | null>(null)
  const [savingDecision, setSavingDecision] = useState(false)
  const [decisionMessage, setDecisionMessage] = useState('')
  const [error, setError] = useState('')


  //reset logic
  useEffect(() => {
    if (result) return
    setApprovalDecision(null)
    setSavingDecision(false)
    setDecisionMessage('')
    setError('')
  }, [result])

  const handleApprovalDecision = async (decision: ApprovalDecision) => {
    if (!workflow || !resumeFile || !result) return

    setSavingDecision(true)
    setError('')
    setDecisionMessage('')

    const approved = decision === 'approve'

    try {
      const response = await workflowService.executeWithPdf(
        workflow.id,
        { human_approved: approved },
        resumeFile,
      )


      setApprovalDecision(decision)

      setDecisionMessage('Decision saved successfully.')
      onDecisionComplete(decision, response.data)
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } }
      setError(apiError.response?.data?.detail || 'Unable to save decision. Please try again.')
    } finally {
      setSavingDecision(false)
    }
  }

  const clearError = () => setError('')

  return {
    approvalDecision,
    savingDecision,
    decisionMessage,
    error,
    handleApprovalDecision,
    clearError,
  }
}
