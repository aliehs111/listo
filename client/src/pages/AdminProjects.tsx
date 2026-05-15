import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Project } from '../types'

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', client_name: '', jobsite_address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listProjects().then(setProjects).finally(() => setLoading(false))
  }, [])

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: toSlug(name) }))
  }

  const handleCreate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const project = await api.createProject(form)
      setProjects(prev => [project, ...prev])
      setShowForm(false)
      setForm({ name: '', slug: '', client_name: '', jobsite_address: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
        >
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-col gap-4">
          <input
            required
            placeholder="Project name"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <div>
            <input
              required
              placeholder="Slug (URL-safe)"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
            />
            <p className="text-xs text-gray-400 mt-1">Workers will access this at /p/{form.slug || '...'}</p>
          </div>
          <input
            placeholder="Client name (optional)"
            value={form.client_name}
            onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Jobsite address (optional)"
            value={form.jobsite_address}
            onChange={e => setForm(f => ({ ...f, jobsite_address: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
          >
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

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
