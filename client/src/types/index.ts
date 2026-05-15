export interface Project {
  id: string
  name: string
  slug: string
  client_name: string | null
  gc_company: string | null
  jobsite_address: string | null
  timezone: string
  status: string
  default_language: string
  created_at: string
}

export interface Alert {
  id: string
  project_id: string
  title: string
  message_original: string
  message_en: string | null
  message_es: string | null
  severity: 'info' | 'operational' | 'safety' | 'critical'
  category: string | null
  display_as_banner: boolean
  requires_acknowledgement: boolean
  starts_at: string
  expires_at: string | null
  active_for_remainder_of_project: boolean
  status: string
  audio_url_en: string | null
  audio_url_es: string | null
  audio_status: string
  created_at: string
  updated_at: string
}

export interface ContextItem {
  id: string
  project_id: string
  category: string
  title: string
  content_original: string
  content_en: string | null
  content_es: string | null
  source_language: string
  status: string
  priority: number
  is_active: boolean
  audio_url_en: string | null
  audio_url_es: string | null
  audio_status: string
  created_at: string
  updated_at: string
}

export interface IssueReport {
  id: string
  project_id: string
  category: string | null
  severity: string
  location_text: string | null
  description_original: string
  status: string
  requested_sitewide_alert: boolean
  created_at: string
}

export interface WorkerHomeData {
  project: Project
  active_alerts: Alert[]
  required_unacknowledged_alerts: Alert[]
  quick_actions: string[]
}

export interface ChatResponse {
  answer: string
  chat_session_id: string
  interaction_id: string
  scope_classification: string
  language: string
}

export type Language = 'en' | 'es'
