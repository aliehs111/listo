import { useState } from 'react'
import type { Alert } from '../types'
import { api } from '../api/client'

interface Props {
  alerts: Alert[]
  deviceSessionId: string | null
  language?: 'en' | 'es'
  onAllAcknowledged: () => void
}

export default function RequiredAlertModal({ alerts, deviceSessionId, language = 'en', onAllAcknowledged }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  if (alerts.length === 0) return null

  const alert = alerts[currentIndex]
  const message = (language === 'es' && alert.message_es) ? alert.message_es : (alert.message_en ?? alert.message_original)

  const handleAcknowledge = async () => {
    setLoading(true)
    try {
      await api.acknowledgeAlert(alert.id, {
        device_session_id: deviceSessionId ?? undefined,
        language_used: language,
        heard_audio: false,
      })
      if (currentIndex + 1 >= alerts.length) {
        onAllAcknowledged()
      } else {
        setCurrentIndex(i => i + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="mb-1 text-xs font-medium text-gray-400 uppercase tracking-widest">
          Required Update {alerts.length > 1 ? `${currentIndex + 1} of ${alerts.length}` : ''}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{alert.title}</h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-6">{message}</p>
        <button
          onClick={handleAcknowledge}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
        >
          {loading ? 'Confirming...' : 'I Understand'}
        </button>
      </div>
    </div>
  )
}
