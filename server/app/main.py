from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import projects, context, alerts, worker, chat, reports

app = FastAPI(title="Listo API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(projects.router)
app.include_router(context.router)
app.include_router(alerts.router)
app.include_router(worker.router)
app.include_router(chat.router)
app.include_router(reports.router)
