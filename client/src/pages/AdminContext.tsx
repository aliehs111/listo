import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { ContextItem } from '../types'

const CATEGORIES = [
  'parking', 'site_access_id', 'deliveries', 'ppe', 'work_hours',
  'restricted_areas', 'lifts_hoists', 'contacts', 'safety_rules',
]

export default function AdminContext() {
  const { id } = useParams<{ id: string }>()
  const [items, setItems] = useState<ContextItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: 'parking', title: '', content_original: '', is_active: false })

  useEffect(() => {
    if (id) api.listContext(id, true).then(setItems)
  }, [id])

  const handleCreate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!id) return
    const item = await api.createContextItem(id, { ...form, status: form.is_active ? 'active' : 'draft' })
    setItems(prev => [item, ...prev])
    setShowForm(false)
    setForm({ category: 'parking', title: '', content_original: '', is_active: false })
  }

  const handlePublish = async (item: ContextItem) => {
    const updated = await api.updateContextItem(item.id, { is_active: true, status: 'active' })
    setItems(prev => prev.map(i => i.id === item.id ? updated : i))
  }

  const handleUnpublish = async (item: ContextItem) => {
    const updated = await api.updateContextItem(item.id, { is_active: false, status: 'draft' })
    setItems(prev => prev.map(i => i.id === item.id ? updated : i))
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
        ← Projects
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Context Items</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
        >
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-col gap-4">
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
          </select>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Content"
            value={form.content_original}
            onChange={e => setForm(f => ({ ...f, content_original: e.target.value }))}
            rows={4}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
            />
            Publish immediately
          </label>
          <button type="submit" className="py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}>
            Save
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.category.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.status}
                </span>
                {!item.is_active ? (
                  <button
                    onClick={() => handlePublish(item)}
                    className="text-xs px-3 py-1 rounded-lg"
                    style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnpublish(item)}
                    className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-500"
                  >
                    Unpublish
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.content_original}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-sm">No context items yet.</p>}
      </div>
    </div>
  )
}
