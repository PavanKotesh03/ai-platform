import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workflowService } from '@/app/services/workflow'
import { authService } from '@/app/services/auth'
import { useAuth } from '@/app/store/AuthContext'
import Button from '@/app/common/Button'
import type { Workflow } from '@/app/store/types'

const WORKFLOW_ROUTES: Record<string, string> = {
  summarizer: '/summarizer',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [error, setError] = useState('')

  const openWorkflow = (workflow: Workflow) => {
    if (workflow.name !== 'smart_resume_flow') {
      return
    }

    navigate(`/workflows/${workflow.id}`, { state: { workflow } })
  }

  useEffect(() => {
    let cancelled = false 

    workflowService.list()
      .then((res) => { if (!cancelled) setWorkflows(res.data.workflows) })
      .catch((err: unknown) => {
        if (!cancelled) {
          const e = err as { response?: { data?: { detail?: string } } }
          setError(e.response?.data?.detail || 'Unable to load workflows right now.')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

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

  const handleWorkflowClick = (workflow: Workflow) => {
    const route = WORKFLOW_ROUTES[workflow.name.toLowerCase()]
    if (route) {
      navigate(route, { state: { workflowId: workflow.id } })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <header className="border-b border-[#DDDDDD] bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-[#761819]">Agentic AI Platform</p>
            <h1 className="text-2xl font-bold text-[#002126]">Workflow Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#1E1F21]">{user?.username}</p>
              <p className="text-xs text-[#6D6E6F]">{user?.email}</p>
            </div>
            <div className="w-28">
              <Button variant="ghost" loading={logoutLoading} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-2xl border border-[#DDDDDD] bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-[#6D6E6F]">Loading workflows...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-2xl border border-[#DDDDDD] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#002126]">No workflows found</p>
            <p className="mt-2 text-sm text-[#6D6E6F]">
              Once workflows are registered in the backend, they will appear here.
            </p>
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map((workflow) => {
              const isSmartResume = workflow.name === 'smart_resume_flow'
              const isNavigable = isSmartResume || !!WORKFLOW_ROUTES[workflow.name.toLowerCase()]
              const handleClick = isSmartResume 
                ? () => openWorkflow(workflow)
                : () => handleWorkflowClick(workflow)

              return (
                <article
                  key={workflow.id}
                  onClick={handleClick}
                  className={`rounded-2xl border border-[#DDDDDD] bg-white p-6 shadow-sm transition
                    ${isNavigable
                      ? 'cursor-pointer hover:border-[#761819] hover:shadow-md'
                      : 'cursor-default opacity-60'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-[#002126] capitalize">
                      {workflow.name}
                    </h3>
                    {isNavigable && (
                      <svg className="h-4 w-4 text-[#761819]" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </div>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#6D6E6F]">
                    {workflow.description || 'No description provided yet.'}
                  </p>
                  {isSmartResume && (
                    <span className="mt-3 inline-block rounded-full bg-[#761819] text-white px-2.5 py-1 text-xs">
                      Execute
                    </span>
                  )}
                  {!isNavigable && !isSmartResume && (
                    <span className="mt-3 inline-block rounded-full bg-[#F8F8F8] px-2.5 py-1 text-xs text-[#6D6E6F]">
                      Coming soon
                    </span>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}