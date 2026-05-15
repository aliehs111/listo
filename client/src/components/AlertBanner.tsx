import type { Alert } from '../types'

const severityStyles: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  operational: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  safety: 'bg-orange-50 border-orange-200 text-orange-900',
  critical: 'bg-red-50 border-red-200 text-red-900',
}

interface Props {
  alert: Alert
  language?: 'en' | 'es'
}

export default function AlertBanner({ alert, language = 'en' }: Props) {
  const message = (language === 'es' && alert.message_es) ? alert.message_es : (alert.message_en ?? alert.message_original)
  const style = severityStyles[alert.severity] ?? severityStyles.operational

  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${style}`}>
      <p className="font-semibold">{alert.title}</p>
      <p className="mt-1">{message}</p>
    </div>
  )
}
