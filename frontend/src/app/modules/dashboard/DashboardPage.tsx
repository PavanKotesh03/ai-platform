import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/app/common/Button'
import { workflowService } from '@/app/services/workflow'
import { authService } from '@/app/services/auth'
import { useAuth } from '@/app/store/AuthContext'
import type { Workflow } from '@/app/store/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    workflowService
      .list()
      .then((response) => {
        setWorkflows(response.data.workflows)
      })
      .catch((err: unknown) => {
        const apiError = err as { response?: { data?: { detail?: string } } }
        setError(apiError.response?.data?.detail || 'Unable to load workflows right now.')
      })
      .finally(() => {
        setLoading(false)
      })
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
              <Button type="button" variant="ghost" loading={logoutLoading} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-2xl border border-[#DDDDDD] bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-[#6D6E6F]">Loading workflows...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
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
            {workflows.map((workflow) => (
              <article
                key={workflow.id}
                className="rounded-2xl border border-[#DDDDDD] bg-white p-6 shadow-sm transition hover:border-[#761819]"
              >
                <h3 className="text-xl font-semibold text-[#002126]">{workflow.name}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[#6D6E6F]">
                  {workflow.description || 'No description provided yet.'}
                </p>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
