from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


# --- Projects ---

class ProjectCreate(BaseModel):
    name: str
    slug: str
    client_name: Optional[str] = None
    gc_company: Optional[str] = None
    jobsite_address: Optional[str] = None
    timezone: str = "America/New_York"
    default_language: str = "en"


class ProjectRead(BaseModel):
    id: UUID
    name: str
    slug: str
    client_name: Optional[str]
    gc_company: Optional[str]
    jobsite_address: Optional[str]
    timezone: str
    status: str
    default_language: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Context Items ---

class ContextItemCreate(BaseModel):
    category: str
    title: str
    content_original: str
    content_en: Optional[str] = None
    content_es: Optional[str] = None
    source_language: str = "en"
    status: str = "draft"
    priority: int = 0
    is_active: bool = False


class ContextItemUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    content_original: Optional[str] = None
    content_en: Optional[str] = None
    content_es: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class ContextItemRead(BaseModel):
    id: UUID
    project_id: UUID
    category: str
    title: str
    content_original: str
    content_en: Optional[str]
    content_es: Optional[str]
    source_language: str
    status: str
    priority: int
    is_active: bool
    audio_url_en: Optional[str]
    audio_url_es: Optional[str]
    audio_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Alerts ---

class AlertCreate(BaseModel):
    title: str
    message_original: str
    message_en: Optional[str] = None
    message_es: Optional[str] = None
    source_language: str = "en"
    severity: str = "operational"
    category: Optional[str] = None
    display_as_banner: bool = True
    requires_acknowledgement: bool = False
    expires_at: Optional[datetime] = None
    active_for_remainder_of_project: bool = False
    status: str = "draft"


class AlertUpdate(BaseModel):
    title: Optional[str] = None
    message_original: Optional[str] = None
    message_en: Optional[str] = None
    message_es: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    display_as_banner: Optional[bool] = None
    requires_acknowledgement: Optional[bool] = None
    expires_at: Optional[datetime] = None
    status: Optional[str] = None


class AlertRead(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    message_original: str
    message_en: Optional[str]
    message_es: Optional[str]
    severity: str
    category: Optional[str]
    display_as_banner: bool
    requires_acknowledgement: bool
    starts_at: datetime
    expires_at: Optional[datetime]
    active_for_remainder_of_project: bool
    status: str
    audio_url_en: Optional[str]
    audio_url_es: Optional[str]
    audio_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Alert Acknowledgement ---

class AcknowledgeAlertRequest(BaseModel):
    device_session_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    project_access_session_id: Optional[UUID] = None
    language_used: str = "en"
    heard_audio: bool = False


# --- Worker ---

class WorkerAccessRequest(BaseModel):
    slug: str
    access_code: Optional[str] = None
    device_session_token: Optional[str] = None
    preferred_language: str = "en"
    access_method: str = "direct_url"
    trade_company: Optional[str] = None
    role_label: Optional[str] = None


class WorkerHomeResponse(BaseModel):
    project: ProjectRead
    active_alerts: List[AlertRead]
    required_unacknowledged_alerts: List[AlertRead]
    quick_actions: List[str]


# --- Chat ---

class ChatRequest(BaseModel):
    project_id: UUID
    question: str
    chat_session_id: Optional[UUID] = None
    device_session_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    preferred_language: str = "en"
    trade_company: Optional[str] = None
    role_label: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    chat_session_id: UUID
    interaction_id: UUID
    scope_classification: str
    language: str


# --- Issue Reports ---

class IssueReportCreate(BaseModel):
    description_original: str
    category: Optional[str] = None
    severity: str = "medium"
    location_text: Optional[str] = None
    source_language: str = "en"
    reporter_company: Optional[str] = None
    reporter_role: Optional[str] = None
    requested_sitewide_alert: bool = False


class IssueReportRead(BaseModel):
    id: UUID
    project_id: UUID
    category: Optional[str]
    severity: str
    location_text: Optional[str]
    description_original: str
    status: str
    requested_sitewide_alert: bool
    created_at: datetime

    class Config:
        from_attributes = True
