import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../common/ProtectedRoute'
import GuestRoute from '../common/GuestRoute'
import LoginPage from '../modules/auth/LoginPage'
import RegisterPage from '../modules/auth/RegisterPage'
import DashboardPage from '../modules/dashboard/DashboardPage'
import SummarizerPage from '../modules/workflow/summarizer/SummarizerPage'
import SmartResumePage from '../modules/workflow/smart_resume_flow/SmartResumePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/summarizer" element={<SummarizerPage />} />
        <Route path="/smart-resume" element={<SmartResumePage />} />
      </Route>
    </Routes>
  )
}