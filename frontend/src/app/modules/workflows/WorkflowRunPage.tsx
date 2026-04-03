import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '@/app/common/Button'
import { authService } from '@/app/services/auth'
import { workflowService } from '@/app/services/workflow'
import { useAuth } from '@/app/store/AuthContext'
import type { ExecutionResponse, Workflow } from '@/app/store/types'

type ReviewDecision = 'pending' | 'approve' | 'reject'

interface LocationState {
  workflow?: Workflow
}

export default function WorkflowRunPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { workflowId = '' } = useParams()
  const { user, setUser } = useAuth()

  //
  const [workflow, setWorkflow] = useState<Workflow | null>(
    (location.state as LocationState | null)?.workflow ?? null,
  )

  //
  const [loadingWorkflow, setLoadingWorkflow] = useState(!workflow)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>('pending')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ExecutionResponse | null>(null)

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
        setError(apiError.response?.data?.detail || 'Unable to load workflow details right now.')
      })
      .finally(() => {
        setLoadingWorkflow(false) // off spinner
      })
  }, [workflow, workflowId])

  const handleLogout = async () => {
    setLogoutLoading(true) //sow spinner
    try {
      await authService.logout()
    } finally {
      setUser(null)
      navigate('/login', { replace: true })
      setLogoutLoading(false)
    }
  }

  const humanApproved = useMemo(() => {
    if (reviewDecision === 'approve') {
      return true
    }
    if (reviewDecision === 'reject') {
      return false
    }
    return undefined
  }, [reviewDecision])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!workflow) {
      return
    }

    if (workflow.name !== 'smart_resume_flow') {
      setError('This workflow is not yet available in the frontend.')
      return
    }

    if (!resumeFile) {
      setError('A PDF resume is required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const input = {
        human_approved: humanApproved,
      }

      const response = await workflowService.executeWithPdf(workflow.id, input, resumeFile)

      setResult(response.data)
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } }
      setError(apiError.response?.data?.detail || 'Workflow execution failed. Please try again.')
      setResult(null)
    } finally {
      setSubmitting(false)
    }
  }

  const resultData = result?.data
  const matchedJd = resultData?.matched_jd as Record<string, unknown> | undefined
  const assignedInterviewer = resultData?.assigned_interviewer as Record<string, unknown> | undefined
  const scheduleDetails = resultData?.schedule_details as Record<string, unknown> | undefined

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
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#1E1F21]">Resume PDF</label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null
                    setResumeFile(nextFile)
                  }}
                  className="rounded-xl border border-[#DDDDDD] bg-white px-4 py-3 text-sm text-[#1E1F21] file:mr-4 file:rounded-lg file:border-0 file:bg-[#761819] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                />
                
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#1E1F21]">Human review decision</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#1E1F21]">
                    <input
                      type="radio"
                      name="reviewDecision"
                      checked={reviewDecision === 'pending'}
                      onChange={() => setReviewDecision('pending')}
                    />
                    Pending review
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#1E1F21]">
                    <input
                      type="radio"
                      name="reviewDecision"
                      checked={reviewDecision === 'approve'}
                      onChange={() => setReviewDecision('approve')}
                    />
                    Approve
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#1E1F21]">
                    <input
                      type="radio"
                      name="reviewDecision"
                      checked={reviewDecision === 'reject'}
                      onChange={() => setReviewDecision('reject')}
                    />
                    Reject
                  </label>
                </div>
              
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="w-full sm:w-40">
                <Button type="submit" loading={submitting}>
                  Run workflow
                </Button>
              </div>
            </form>
          )}
        </section>

        <aside className="rounded-2xl border border-[#DDDDDD] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-[#002126]">Execution result</h3>

          {!result ? (
            <p className="mt-4 text-sm leading-6 text-[#6D6E6F]">
              Run the workflow to see extracted candidate details, job match, interviewer assignment,
              scheduling output, and review status.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4 text-sm text-[#1E1F21]">
              <div className="rounded-xl bg-[#F8F8F8] p-4">
                <p><span className="font-semibold">Candidate:</span> {String(resultData?.candidate_name ?? '-')}</p>
                <p><span className="font-semibold">Email:</span> {String(resultData?.candidate_email ?? '-')}</p>
                <p><span className="font-semibold">Domain:</span> {String(resultData?.extracted_domain ?? '-')}</p>
              </div>

              <div className="rounded-xl bg-[#F8F8F8] p-4">
                <p className="font-semibold text-[#002126]">Match</p>
                <p className="mt-2">Found: {String(resultData?.match_found ?? false)}</p>
                <p>Job: {String(matchedJd?.title ?? '-')}</p>
                <p>Job ID: {String(matchedJd?.id ?? '-')}</p>
              </div>

              <div className="rounded-xl bg-[#F8F8F8] p-4">
                <p className="font-semibold text-[#002126]">Interviewer</p>
                <p className="mt-2">Name: {String(assignedInterviewer?.name ?? '-')}</p>
                <p>Email: {String(assignedInterviewer?.email ?? '-')}</p>
              </div>

              <div className="rounded-xl bg-[#F8F8F8] p-4">
                <p className="font-semibold text-[#002126]">Review and scheduling</p>
                <p className="mt-2">Human approved: {String(resultData?.human_approved ?? 'pending')}</p>
                <p>Scheduled: {String(resultData?.scheduled ?? false)}</p>
                {(resultData?.review_reason ?? '') ? (
                  <p>Review reason: {String(resultData?.review_reason)}</p>
                ) : null}
                <p>Date: {String(scheduleDetails?.date ?? '-')}</p>
                <p>Time: {String(scheduleDetails?.time ?? '-')}</p>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
