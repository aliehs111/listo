const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${text}`)
  }
  return res.json()
}

export const api = {
  // Health
  health: () => request<{ status: string }>('/health'),

  // Projects
  listProjects: () => request<import('../types').Project[]>('/api/projects'),
  getProject: (slug: string) => request<import('../types').Project>(`/api/projects/${slug}`),
  createProject: (data: unknown) =>
    request<import('../types').Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Worker
  workerHome: (slug: string, deviceSessionId?: string) => {
    const qs = deviceSessionId ? `?device_session_id=${deviceSessionId}` : ''
    return request<import('../types').WorkerHomeData>(`/api/worker/projects/${slug}/home${qs}`)
  },

  // Alerts
  activeAlerts: (projectId: string) =>
    request<import('../types').Alert[]>(`/api/projects/${projectId}/alerts/active`),
  createAlert: (projectId: string, data: unknown) =>
    request<import('../types').Alert>(`/api/projects/${projectId}/alerts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAlert: (alertId: string, data: unknown) =>
    request<import('../types').Alert>(`/api/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  acknowledgeAlert: (alertId: string, data: unknown) =>
    request<{ acknowledged: boolean }>(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Context
  listContext: (projectId: string) =>
    request<import('../types').ContextItem[]>(`/api/projects/${projectId}/context`),
  createContextItem: (projectId: string, data: unknown) =>
    request<import('../types').ContextItem>(`/api/projects/${projectId}/context`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateContextItem: (itemId: string, data: unknown) =>
    request<import('../types').ContextItem>(`/api/context/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Chat
  ask: (data: unknown) =>
    request<import('../types').ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reports
  createReport: (projectId: string, data: unknown) =>
    request<import('../types').IssueReport>(`/api/projects/${projectId}/reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listReports: (projectId: string) =>
    request<import('../types').IssueReport[]>(`/api/projects/${projectId}/reports`),
}
