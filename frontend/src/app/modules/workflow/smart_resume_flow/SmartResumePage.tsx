import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '@/app/services/auth'
import { workflowService } from '@/app/services/workflow'
import { useAuth } from '@/app/store/AuthContext'
import type { ExecutionResponse, Workflow } from '@/app/store/types'
import SmartResumeHeader from './components/SmartResumeHeader'
import WorkflowSection from './components/WorkflowSection'
import { useDecisionHandler } from './hooks/useDecisionHandler'
import { useFileHandler } from './hooks/useFileHandler'
import { useWorkflowFetch } from './hooks/useWorkflowFetch'
import ResultsPanel from './ResultsPanel'

type ExecutionStep = 'upload' | 'results' | 'decision_saved'

export default function SmartResumePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  const workflowFromLocation = (location.state as { workflow?: Workflow } | null)?.workflow
  const { workflow, workflowLoading, workflowError } = useWorkflowFetch(workflowFromLocation)
  const {
    resumeFile,
    fileInputRef,
    fileInputKey,
    setResumeFile,
    setFileInputKey,
    handleFileAction,
  } = useFileHandler()

  const [logoutLoading, setLogoutLoading] = useState(false)
  const [executionStep, setExecutionStep] = useState<ExecutionStep>('upload')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ExecutionResponse | null>(null)
  const {
    approvalDecision,
    savingDecision,
    decisionMessage,
    error: decisionError,
    handleApprovalDecision,
    clearError: clearDecisionError,
  } = useDecisionHandler(workflow, resumeFile, result, (_decision, updatedResult) => {
    if (updatedResult) setResult(updatedResult)
    setExecutionStep('decision_saved')
  })

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      navigate('/login', { replace: true })
      setLogoutLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!workflow) return
    if (!resumeFile) {
      setError('A PDF resume is required.')
      return
    }

    setSubmitting(true)
    setError('')
    clearDecisionError()

    try {
      const response = await workflowService.executeWithPdf(
        workflow.id,
        {},
        resumeFile,
      )
      setResult(response.data)
      setExecutionStep('results')
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } }
      setError(apiError.response?.data?.detail || 'Workflow execution failed. Please try again.')
      setResult(null)
      setExecutionStep('upload')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setExecutionStep('upload')
    setResult(null)
    setResumeFile(null)
    setError('')
    clearDecisionError()
    setSubmitting(false)
    setFileInputKey((prev) => prev + 1)
  }

  const resultData = result?.data
  const showResultsPanel = executionStep !== 'upload' && !!result
  const uploadError = error || decisionError
  const resultsError = decisionError || error

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <SmartResumeHeader user={user} logoutLoading={logoutLoading} onLogout={handleLogout} />

      <main
        className={`mx-auto grid w-full max-w-5xl items-start gap-5 px-4 py-6 sm:px-6 lg:px-8 ${
          showResultsPanel ? 'grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]' : 'grid-cols-1'
        }`}
      >
        <WorkflowSection
          workflowLoading={workflowLoading}
          workflow={workflow}
          workflowError={workflowError}
          executionStep={executionStep}
          resumeFile={resumeFile}
          submitting={submitting}
          uploadError={uploadError}
          resultsError={resultsError}
          fileInputRef={fileInputRef}
          fileInputKey={fileInputKey}
          onFileChange={setResumeFile}
          onFileAction={handleFileAction}
          onSubmit={handleSubmit}
          onClearUploadError={() => {
            setError('')
            clearDecisionError()
          }}
          onReset={handleReset}
        />

        {showResultsPanel ? (
          <ResultsPanel
            resultData={resultData}
            executionStep={executionStep}
            approvalDecision={approvalDecision}
            savingDecision={savingDecision}
            decisionMessage={decisionMessage}
            onApprovalDecision={handleApprovalDecision}
            onReset={handleReset}
          />
        ) : null}
      </main>
    </div>
  )
}
