import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function GuestRoute() {
  const { user } = useAuth()


  return user ? <Navigate to="/" replace /> : <Outlet />
}