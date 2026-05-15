import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Alert } from '../types'

const SEVERITIES = ['info', 'operational', 'safety', 'critical']

export default function AdminAlerts() {
  const { id } = useParams<{ id: string }>()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    message_original: '',
    severity: 'operational',
    requires_acknowledgement: false,
    status: 'draft',
  })

  useEffect(() => {
    if (id) api.activeAlerts(id).then(setAlerts)
  }, [id])

  const submitAlert = async (statusOverride?: string) => {
    if (!id) return
    const data = statusOverride ? { ...form, status: statusOverride } : form
    const alert = await api.createAlert(id, data)
    setAlerts(prev => [alert, ...prev])
    setShowForm(false)
    setForm({ title: '', message_original: '', severity: 'operational', requires_acknowledgement: false, status: 'draft' })
  }

  const handleCreate = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    submitAlert()
  }

  const handlePublish = async (alertId: string) => {
    const updated = await api.updateAlert(alertId, { status: 'active' })
    setAlerts(prev => prev.map(a => a.id === alertId ? updated : a))
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
        ← Projects
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Alerts</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
        >
          {showForm ? 'Cancel' : 'New Alert'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-col gap-4">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Message"
            value={form.message_original}
            onChange={e => setForm(f => ({ ...f, message_original: e.target.value }))}
            rows={3}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
          />
          <select
            value={form.severity}
            onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.requires_acknowledgement}
              onChange={e => setForm(f => ({ ...f, requires_acknowledgement: e.target.checked }))}
            />
            Requires acknowledgement
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => submitAlert('active')}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
            >
              Publish Now
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {alerts.map(alert => (
          <div key={alert.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{alert.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{alert.severity} · {alert.status}</p>
              </div>
              {alert.status === 'draft' && (
                <button
                  onClick={() => handlePublish(alert.id)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
                >
                  Publish
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{alert.message_original}</p>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-gray-400 text-sm">No active alerts.</p>}
      </div>
    </div>
  )
}
