// src/app/routes/index.tsx

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../common/ProtectedRoute'
import GuestRoute from '../common/GuestRoute'
import RegisterPage from '../modules/auth/RegisterPage'
import LoginPage from '../modules/auth/LoginPage'
import DashboardPage from '../modules/dashboard/DashboardPage'
import SummarizerPage from '../modules/summarizer/SummarizePage'

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
      </Route>
    </Routes>
  )
}