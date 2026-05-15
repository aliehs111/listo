import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, Numeric, String, Text,
    TIMESTAMP, ARRAY, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


def now_utc():
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    slug = Column(Text, unique=True, nullable=False)
    client_name = Column(Text)
    gc_company = Column(Text)
    jobsite_address = Column(Text)
    timezone = Column(Text, default="America/New_York")
    status = Column(Text, default="active")
    default_language = Column(Text, default="en")
    field_access_code_hash = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    updated_at = Column(TIMESTAMP(timezone=True), default=now_utc, onupdate=now_utc)

    context_items = relationship("ContextItem", back_populates="project")
    alerts = relationship("Alert", back_populates="project")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True)
    name = Column(Text)
    company = Column(Text)
    role = Column(Text)
    phone = Column(Text)
    preferred_language = Column(Text, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    updated_at = Column(TIMESTAMP(timezone=True), default=now_utc, onupdate=now_utc)


class ProjectUser(Base):
    __tablename__ = "project_users"
    __table_args__ = (UniqueConstraint("project_id", "user_id"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(Text, nullable=False)
    company = Column(Text)
    trade = Column(Text)
    can_edit_context = Column(Boolean, default=False)
    can_create_alerts = Column(Boolean, default=False)
    can_broadcast_alerts = Column(Boolean, default=False)
    can_review_reports = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    updated_at = Column(TIMESTAMP(timezone=True), default=now_utc, onupdate=now_utc)


class DeviceSession(Base):
    __tablename__ = "device_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_session_token = Column(Text, unique=True, nullable=False)
    preferred_language = Column(Text, default="en")
    last_selected_project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    last_active_at = Column(TIMESTAMP(timezone=True), default=now_utc)


class ProjectAccessSession(Base):
    __tablename__ = "project_access_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    device_session_id = Column(UUID(as_uuid=True), ForeignKey("device_sessions.id"))
    access_method = Column(Text)
    trade_company = Column(Text)
    role_label = Column(Text)
    preferred_language = Column(Text, default="en")
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    last_accessed_at = Column(TIMESTAMP(timezone=True), default=now_utc)


class ContextSource(Base):
    __tablename__ = "context_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    source_type = Column(Text)
    source_name = Column(Text)
    source_url = Column(Text)
    uploaded_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    raw_text = Column(Text)
    parsed_summary = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)


class ContextItem(Base):
    __tablename__ = "context_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    category = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    content_original = Column(Text, nullable=False)
    content_en = Column(Text)
    content_es = Column(Text)
    source_language = Column(Text, default="en")
    status = Column(Text, default="draft")
    priority = Column(Integer, default=0)
    is_active = Column(Boolean, default=False)
    effective_from = Column(TIMESTAMP(timezone=True))
    expires_at = Column(TIMESTAMP(timezone=True))
    review_by = Column(TIMESTAMP(timezone=True))
    source_id = Column(UUID(as_uuid=True), ForeignKey("context_sources.id"))
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    audio_url_en = Column(Text)
    audio_url_es = Column(Text)
    audio_status = Column(Text, default="not_generated")
    audio_generated_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    updated_at = Column(TIMESTAMP(timezone=True), default=now_utc, onupdate=now_utc)

    project = relationship("Project", back_populates="context_items")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    title = Column(Text, nullable=False)
    message_original = Column(Text, nullable=False)
    message_en = Column(Text)
    message_es = Column(Text)
    source_language = Column(Text, default="en")
    severity = Column(Text, default="operational")
    category = Column(Text)
    display_as_banner = Column(Boolean, default=True)
    requires_acknowledgement = Column(Boolean, default=False)
    starts_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    expires_at = Column(TIMESTAMP(timezone=True))
    active_for_remainder_of_project = Column(Boolean, default=False)
    status = Column(Text, default="draft")
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    delete_reason = Column(Text)
    promoted_context_id = Column(UUID(as_uuid=True), ForeignKey("context_items.id"))
    promoted_at = Column(TIMESTAMP(timezone=True))
    promoted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    audio_url_en = Column(Text)
    audio_url_es = Column(Text)
    audio_status = Column(Text, default="not_generated")
    audio_generated_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    updated_at = Column(TIMESTAMP(timezone=True), default=now_utc, onupdate=now_utc)

    project = relationship("Project", back_populates="alerts")


class AlertAcknowledgement(Base):
    __tablename__ = "alert_acknowledgements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    device_session_id = Column(UUID(as_uuid=True), ForeignKey("device_sessions.id"))
    project_access_session_id = Column(UUID(as_uuid=True), ForeignKey("project_access_sessions.id"))
    language_used = Column(Text, default="en")
    heard_audio = Column(Boolean, default=False)
    acknowledged_at = Column(TIMESTAMP(timezone=True), default=now_utc)


class IssueReport(Base):
    __tablename__ = "issue_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    reported_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reported_by_device_session_id = Column(UUID(as_uuid=True), ForeignKey("device_sessions.id"))
    reporter_company = Column(Text)
    reporter_role = Column(Text)
    category = Column(Text)
    severity = Column(Text, default="medium")
    location_text = Column(Text)
    description_original = Column(Text, nullable=False)
    description_en = Column(Text)
    description_es = Column(Text)
    source_language = Column(Text, default="en")
    photo_url = Column(Text)
    requested_sitewide_alert = Column(Boolean, default=False)
    approved_sitewide_alert = Column(Boolean, default=False)
    status = Column(Text, default="submitted")
    assigned_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"))
    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    reviewed_at = Column(TIMESTAMP(timezone=True))
    closed_at = Column(TIMESTAMP(timezone=True))


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    device_session_id = Column(UUID(as_uuid=True), ForeignKey("device_sessions.id"))
    project_access_session_id = Column(UUID(as_uuid=True), ForeignKey("project_access_sessions.id"))
    trade_company = Column(Text)
    role_label = Column(Text)
    preferred_language = Column(Text, default="en")
    access_method = Column(Text)
    warning_count = Column(Integer, default=0)
    behavior_flag = Column(Text)
    is_rate_limited = Column(Boolean, default=False)
    restricted_until = Column(TIMESTAMP(timezone=True))
    started_at = Column(TIMESTAMP(timezone=True), default=now_utc)
    last_active_at = Column(TIMESTAMP(timezone=True), default=now_utc)

    interactions = relationship("ChatInteraction", back_populates="session")


class ChatInteraction(Base):
    __tablename__ = "chat_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    chat_session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    device_session_id = Column(UUID(as_uuid=True), ForeignKey("device_sessions.id"))
    trade_company = Column(Text)
    role_label = Column(Text)

    original_language = Column(Text)
    question_original = Column(Text, nullable=False)
    question_en = Column(Text)
    answer_original = Column(Text)
    answer_en = Column(Text)

    intent = Column(Text)
    intent_confidence = Column(Numeric)
    resource_needed = Column(Text)
    resource_confidence = Column(Numeric)
    relevance_tags = Column(ARRAY(Text))
    relevance_score = Column(Numeric)

    scope_classification = Column(Text)
    scope_confidence = Column(Numeric)
    out_of_scope_reason = Column(Text)

    urgency = Column(Text)
    safety_relevance = Column(Boolean, default=False)
    unresolved_flag = Column(Boolean, default=False)
    escalation_needed = Column(Boolean, default=False)
    recommended_admin_action = Column(Text)

    contains_vulgarity = Column(Boolean, default=False)
    moderation_action = Column(Text)
    moderation_reason = Column(Text)

    source_context_ids = Column(ARRAY(UUID(as_uuid=True)))
    source_alert_ids = Column(ARRAY(UUID(as_uuid=True)))

    model_used = Column(Text)
    tokens_used = Column(Integer)
    response_time_ms = Column(Integer)

    analysis_json = Column(JSONB)
    translation_json = Column(JSONB)

    created_at = Column(TIMESTAMP(timezone=True), default=now_utc)

    session = relationship("ChatSession", back_populates="interactions")
