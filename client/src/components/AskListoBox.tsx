import { useState } from 'react'

interface Props {
  projectId: string
  chatSessionId: string | null
  deviceSessionId: string | null
  language?: 'en' | 'es'
  onSessionStart?: (sessionId: string) => void
}

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export default function AskListoBox({ projectId, chatSessionId, deviceSessionId, language = 'en', onSessionStart }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [localSessionId, setLocalSessionId] = useState(chatSessionId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const { api } = await import('../api/client')
      const result = await api.ask({
        project_id: projectId,
        question,
        chat_session_id: localSessionId,
        device_session_id: deviceSessionId,
        preferred_language: language,
      })
      if (!localSessionId) {
        setLocalSessionId(result.chat_session_id)
        onSessionStart?.(result.chat_session_id)
      }
      setMessages(prev => [...prev, { role: 'assistant', text: result.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.length > 0 && (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gray-100 text-gray-800 self-end max-w-[85%] ml-auto'
                  : 'bg-white border border-gray-200 text-gray-800 self-start max-w-[85%]'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="px-4 py-3 rounded-xl text-sm text-gray-400 bg-white border border-gray-200 self-start">
              ...
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={language === 'es' ? 'Pregunta sobre este sitio...' : 'Ask about this jobsite...'}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ backgroundColor: '#c8f135', color: '#1a1a1a' }}
        >
          Ask
        </button>
      </form>
    </div>
  )
}
