import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../common/ProtectedRoute'
import GuestRoute from '../common/GuestRoute'
import LoginPage from '../modules/auth/LoginPage'
import RegisterPage from '../modules/auth/RegisterPage'
import DashboardPage from '../modules/dashboard/DashboardPage'
import WorkflowRunPage from '../modules/workflows/WorkflowRunPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workflows/:workflowName" element={<WorkflowRunPage />} />
      </Route>
    </Routes>
  )
}
