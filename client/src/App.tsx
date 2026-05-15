import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WorkerHome from './pages/WorkerHome'
import AdminProjects from './pages/AdminProjects'
import AdminContext from './pages/AdminContext'
import AdminAlerts from './pages/AdminAlerts'
import AdminIntake from './pages/AdminIntake'
import AdminReports from './pages/AdminReports'

function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Listo</h1>
        <p className="text-gray-500 text-sm mb-8">Jobsite operational communication</p>
        <a href="/admin" className="text-sm text-gray-500 underline">Admin</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/p/:slug" element={<WorkerHome />} />
        <Route path="/admin" element={<Navigate to="/admin/projects" replace />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/projects/:id/context" element={<AdminContext />} />
        <Route path="/admin/projects/:id/alerts" element={<AdminAlerts />} />
        <Route path="/admin/projects/:id/intake" element={<AdminIntake />} />
        <Route path="/admin/projects/:id/reports" element={<AdminReports />} />
      </Routes>
    </BrowserRouter>
  )
}
