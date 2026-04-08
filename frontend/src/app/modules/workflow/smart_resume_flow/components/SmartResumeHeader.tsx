import Button from '@/app/common/Button'
import type { User } from '@/app/store/types'

interface SmartResumeHeaderProps {
  user: User | null
  logoutLoading: boolean
  onLogout: () => Promise<void>
}

export default function SmartResumeHeader({
  user,
  logoutLoading,
  onLogout,
}: SmartResumeHeaderProps) {
  return (
    <header className="border-b border-[#DDDDDD] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-[#761819]">Agentic AI Platform</p>
          <h1 className="text-2xl font-bold text-[#002126]">Smart Resume Flow</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-[#1E1F21]">{user?.username}</p>
            <p className="text-xs text-[#6D6E6F]">{user?.email}</p>
          </div>
          <div className="w-28">
            <Button type="button" variant="ghost" loading={logoutLoading} onClick={() => void onLogout()}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
