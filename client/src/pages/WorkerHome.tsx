import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { WorkerHomeData } from '../types'
import AlertBanner from '../components/AlertBanner'
import RequiredAlertModal from '../components/RequiredAlertModal'
import QuickActionGrid from '../components/QuickActionGrid'
import AskListoBox from '../components/AskListoBox'

function getOrCreateDeviceSession(): string {
  let token = localStorage.getItem('listo_device_session')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('listo_device_session', token)
  }
  return token
}

export default function WorkerHome() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<WorkerHomeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [chatSessionId, setChatSessionId] = useState<string | null>(null)
  const deviceSessionId = getOrCreateDeviceSession()

  const load = useCallback(async () => {
    if (!slug) return
    try {
      const result = await api.workerHome(slug, deviceSessionId)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project')
    }
  }, [slug, deviceSessionId])

  useEffect(() => { load() }, [load])

  const handleQuickAction = (_action: string) => {
    // Prefill AskListoBox with the quick action as a question
    // For now we just scroll to the ask box — full implementation in next milestone
    const el = document.getElementById('ask-box')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  const showModal = !acknowledged && data.required_unacknowledged_alerts.length > 0

  return (
    <>
      {showModal && (
        <RequiredAlertModal
          alerts={data.required_unacknowledged_alerts}
          deviceSessionId={deviceSessionId}
          onAllAcknowledged={() => setAcknowledged(true)}
        />
      )}

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Listo</p>
          <h1 className="text-2xl font-semibold text-gray-900">{data.project.name}</h1>
          {data.project.jobsite_address && (
            <p className="text-sm text-gray-500 mt-1">{data.project.jobsite_address}</p>
          )}
        </div>

        {/* Active alerts */}
        {data.active_alerts.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.active_alerts.map(alert => (
              <AlertBanner key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {/* Ask Listo */}
        <div id="ask-box">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Ask Listo</p>
          <AskListoBox
            projectId={data.project.id}
            chatSessionId={chatSessionId}
            deviceSessionId={deviceSessionId}
            onSessionStart={setChatSessionId}
          />
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Quick Info</p>
          <QuickActionGrid actions={data.quick_actions} onAction={handleQuickAction} />
        </div>

        {/* Report */}
        <div className="pt-2">
          <button
            className="w-full py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
          >
            Report an Issue
          </button>
        </div>
      </div>
    </>
  )
}
