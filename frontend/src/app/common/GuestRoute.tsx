import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8]">
        <p className="text-sm text-[#6D6E6F]">Loading...</p>
      </div>
    )
  }

  return user ? <Navigate to="/" replace /> : <Outlet />
}