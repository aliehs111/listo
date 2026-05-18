# Listo — Project Status Summary

_Last updated: 2026-05-16_

## What Listo Is

Listo is a multilingual (English/Spanish), jobsite-specific operational
communication platform for general contractors. It gives field workers
real-time jobsite info, alerts, and an AI chat ("Ask Listo"), while giving
project managers an admin dashboard to manage projects, context, alerts, and
issue reports.

Two interfaces:
- **Worker Home** — workers reach a project by slug, see alerts, ask questions,
  use quick actions.
- **Admin Dashboard** — PMs manage projects, context items, alerts, and reports.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript, Vite, React Router 7, TailwindCSS 4, Heroicons |
| Backend | Python, FastAPI, SQLAlchemy, Uvicorn, Pydantic |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (`listo-audio` bucket) |
| External (planned) | ElevenLabs (TTS), OpenAI (chat/translation) |
| Deploy | Railway |

## Architecture

```
LISTO/
├── server/   FastAPI backend — main.py, config, database, models, schemas,
│             routes/ (projects, context, alerts, worker, chat, reports),
│             services/ (elevenlabs, translation, retrieval, moderation — all stubs)
└── client/   React frontend — pages/ (WorkerHome, AdminProjects, AdminContext,
              AdminAlerts, AdminReports, AdminIntake), components/, api/client.ts
```

## What's Done ✅

**Core CRUD & data model**
- 12 SQLAlchemy models: Project, User, ProjectUser, DeviceSession,
  ProjectAccessSession, ContextSource, ContextItem, Alert,
  AlertAcknowledgement, IssueReport, ChatSession, ChatInteraction
- Multilingual content fields (EN/ES) throughout context, alerts, reports

**Projects**
- Create / list / get-by-slug projects

**Context items**
- CRUD with category, title, content, priority
- Draft vs. published (publish/unpublish toggle)
- Inline edit and delete-with-confirmation in admin UI

**Alerts**
- Create / update / list active (time-based filtering)
- Severity levels: info, operational, safety, critical
- Save as draft or publish
- Required-acknowledgement modal that blocks the worker UI until confirmed
- Acknowledgement logging (language, device session, audio-played flag)
- Promote an alert to a context item

**Worker experience**
- Project access by slug, home screen (alerts, quick actions, project info)
- Color-coded alert banners by severity
- "Ask Listo" chat box with message history
- Quick action grid (parking, PPE, deliveries, etc.)
- Auto-created anonymous device sessions (localStorage token)

**Chat**
- `/api/chat` endpoint: logs interactions, classifies scope
  (in-scope / out-of-scope)
- Rich ChatInteraction logging schema (intent, urgency, safety, moderation,
  cited sources, token/perf metrics)

**Issue reports**
- Submit and list reports by project
- Admin page to view submitted reports

## What's Incomplete / Stubbed ⚠️

**Service stubs (return placeholder / NotImplementedError)**
- ElevenLabs TTS — audio_url fields exist on models, generation not built
- Translation service — content_en/content_es fields exist, no translation
- Retrieval service — chat can cite sources but search returns empty
- Moderation service — moderation fields exist, always returns all-clear

**No real AI chat** — only scope classification; no LLM-generated answers

**Authentication & authorization — not implemented**
- All API endpoints are currently public
- JWT secret in config but unused; no token validation
- ProjectUser role permissions exist in the model but are not enforced
- Only anonymous device sessions exist today

**UI stubs / unfinished**
- AdminIntake page — placeholder ("Coming soon — context intake via conversation")
- "Report an Issue" button on Worker Home — not wired to a form
- Photo upload — `photo_url` in schema, no upload UI
- Quick action buttons scroll to chat but don't prefill the question
- No admin review/approval/closure workflow for issue reports

## Open Questions for Planning

1. **Auth** — what's the priority? Admins clearly need login; workers may stay
   anonymous via device sessions.
2. **AI chat** — wire up OpenAI + retrieval next, or finish admin workflows first?
3. **Audio/TTS** — is spoken alerts a near-term need or later?
4. **Issue report lifecycle** — build the review/triage workflow?
5. **Deployment** — is Railway set up and running, or local-only so far?

## Suggested Next-Step Themes

- **Lock down access** — admin auth + permission enforcement.
- **Make chat real** — OpenAI integration + retrieval over context/alerts.
- **Close the report loop** — admin review workflow + worker report form.
- **Polish worker UX** — quick action prefill, photo upload.
- **Optional later** — TTS audio, translation automation, moderation.
