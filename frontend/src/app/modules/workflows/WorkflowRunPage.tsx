import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '@/app/common/Button'
import { authService } from '@/app/services/auth'
import { workflowService } from '@/app/services/workflow'
import { useAuth } from '@/app/store/AuthContext'
import type { ExecutionResponse, Workflow } from '@/app/store/types'
import DecisionModal from './components/DecisionModal'
import SmartResumeFlowResultPanel from './components/SmartResumeFlowResultPanel'
import SmartResumeFlowUploadForm from './components/SmartResumeFlowUploadForm'
import { usePagination } from './hooks/usePagination'
import type {
  ReviewDecisionState,
  SmartResumeFlowResultData,
  WorkflowLocationState,
} from './types'


const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const RESULT_PAGE_COUNT = 4

function isPdfFile(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function validateResumeFile(file: File | null) {
  if (!file) {
    return 'Upload a PDF resume to continue.'
  }

  if (!isPdfFile(file)) {
    return 'Only PDF files are allowed.'
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'PDF file size must be 10MB or smaller.'
  }

  return ''
}

export default function WorkflowRunPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { workflowId = '' } = useParams()
  const { user, setUser } = useAuth()
  const [workflow, setWorkflow] = useState<Workflow | null>(
    (location.state as WorkflowLocationState | null)?.workflow ?? null,
  )
  const [loadingWorkflow, setLoadingWorkflow] = useState(!workflow)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [executionError, setExecutionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ExecutionResponse | null>(null)
  const [decisionState, setDecisionState] = useState<ReviewDecisionState>('idle')
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const {
    currentPage,
    canGoNext,
    canGoPrevious,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
  } = usePagination(RESULT_PAGE_COUNT)

  useEffect(() => {
    if (workflow) {
      return
    }

    workflowService
      .list()
      .then((response) => {
        const matchedWorkflow = response.data.workflows.find((item) => item.id === workflowId) ?? null
        setWorkflow(matchedWorkflow)
      })
      .catch((err: unknown) => {
        const apiError = err as { response?: { data?: { detail?: string } } }
        setExecutionError(apiError.response?.data?.detail || 'Unable to load workflow details right now.')
      })
      .finally(() => {
        setLoadingWorkflow(false)
      })
  }, [workflow, workflowId])

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

  const handleFileSelect = (file: File | null) => {
    const validationError = validateResumeFile(file)

    setResumeFile(validationError ? null : file)
    setFileError(validationError)
    setExecutionError('')
    setResult(null)
    setDecisionState('idle')
    setShowDecisionModal(false)
    setShowDetails(false)
    resetPagination()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!workflow) {
      return
    }

    if (workflow.name !== 'smart_resume_flow') {
      setExecutionError('This workflow is not yet available in the frontend.')
      return
    }

    const selectedFile = resumeFile
    const validationError = validateResumeFile(selectedFile)
    if (validationError) {
      setFileError(validationError)
      return
    }

    if (!selectedFile) {
      return
    }

    setSubmitting(true)
    setExecutionError('')
    setFileError('')
    setResult(null)
    setDecisionState('idle')
    setShowDecisionModal(false)
    setShowDetails(false)
    resetPagination()

    try {
      const response = await workflowService.executeWithPdf(workflow.id, {}, selectedFile)
      const resultData = response.data.data as SmartResumeFlowResultData
      const needsDecision = resultData.match_found === true && Boolean(resultData.assigned_interviewer)

      setResult(response.data)
      setShowDecisionModal(needsDecision)
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } }
      setExecutionError(apiError.response?.data?.detail || 'Workflow execution failed. Please try again.')
      setResult(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = () => {
    setDecisionState('approved')
    setShowDecisionModal(false)
    setShowDetails(false)
    resetPagination()
  }

  const handleReject = () => {
    setDecisionState('rejected')
    setShowDecisionModal(false)
    setShowDetails(false)
    resetPagination()
  }

  const handleShowDetails = () => {
    setShowDetails(true)
    resetPagination()
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <header className="border-b border-[#DDDDDD] bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-[#761819]">Agentic AI Platform</p>
            <h1 className="text-2xl font-bold text-[#002126]">
              {workflow?.name ?? 'Workflow'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#1E1F21]">{user?.username}</p>
              <p className="text-xs text-[#6D6E6F]">{user?.email}</p>
            </div>
            <div className="w-28">
              <Button type="button" variant="ghost" loading={logoutLoading} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid items-start w-full max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <section className="rounded-2xl border border-[#DDDDDD] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#761819]">
                <Link to="/" className="hover:underline">
                  Back to dashboard
                </Link>
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#002126]">
                Run Smart Resume Flow
              </h2>
            </div>
          </div>

          {loadingWorkflow ? (
            <p className="mt-6 text-sm text-[#6D6E6F]">Loading workflow...</p>
          ) : workflow?.name !== 'smart_resume_flow' ? (
            <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              This route currently supports only `smart_resume_flow`.
            </div>
          ) : (
            <SmartResumeFlowUploadForm
              selectedFileName={resumeFile?.name ?? ''}
              fileError={fileError}
              submitError={executionError}
              submitting={submitting}
              onFileSelect={handleFileSelect}
              onSubmit={handleSubmit}
            />
          )}
        </section>

        <SmartResumeFlowResultPanel
          result={result}
          decisionState={decisionState}
          showDetails={showDetails}
          currentPage={currentPage}
          totalPages={RESULT_PAGE_COUNT}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
          onShowDetails={handleShowDetails}
        />
      </main>

      <DecisionModal
        open={showDecisionModal}
        title="Approve interview review"
        description="A job match and interviewer were found. Approve to unlock the detailed execution breakdown, or reject to stop the review here."
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
