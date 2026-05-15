import { Link } from 'react-router-dom'

export default function AdminIntake() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
        ← Projects
      </Link>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Conversational Intake</h1>
      <p className="text-sm text-gray-400">Coming soon — context intake via conversation.</p>
    </div>
  )
}
