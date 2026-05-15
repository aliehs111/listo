import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { IssueReport } from '../types'

export default function AdminReports() {
  const { id } = useParams<{ id: string }>()
  const [reports, setReports] = useState<IssueReport[]>([])

  useEffect(() => {
    if (id) api.listReports(id).then(setReports)
  }, [id])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
        ← Projects
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">Issue Reports</h1>

      <div className="flex flex-col gap-3">
        {reports.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs text-gray-400">{r.category?.replace(/_/g, ' ') ?? 'General'} · {r.severity}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{r.status}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{r.description_original}</p>
            {r.location_text && <p className="text-xs text-gray-400 mt-1">{r.location_text}</p>}
            <p className="text-xs text-gray-300 mt-2">{new Date(r.created_at).toLocaleString()}</p>
          </div>
        ))}
        {reports.length === 0 && <p className="text-gray-400 text-sm">No reports yet.</p>}
      </div>
    </div>
  )
}
