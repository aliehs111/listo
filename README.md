# Listo

A multilingual, jobsite-specific operational communication and context system for general contractors.

## Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage
- **Voice**: ElevenLabs TTS (English + Spanish)
- **Deploy**: Railway

## Local Development

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

## Milestones

1. Repo + apps boot — React runs, FastAPI runs, `/health` works
2. Database connection — FastAPI connects to Supabase, project model works
3. Context + alerts — add/show context items and alerts
4. Acknowledgement — required alert blocks app, acknowledgement stored
5. Interaction logging — Ask Listo stub logs questions
6. First Railway deploy — backend live, `/health` works in production
