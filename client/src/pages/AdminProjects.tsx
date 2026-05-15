import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Project } from '../types'

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listProjects().then(setProjects).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        <Link
          to="/admin/projects/new"
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 text-sm">No projects yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.slug}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/p/${p.slug}`}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  Worker View
                </Link>
                <Link
                  to={`/admin/projects/${p.id}/context`}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
