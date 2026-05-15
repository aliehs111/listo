import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/chat", tags=["chat"])

SCOPE_RESPONSE = (
    "I can only help with information for this jobsite: "
    "access, parking, deliveries, PPE, safety rules, contacts, and active site updates."
)

IN_SCOPE_INTENTS = {
    "parking", "site_access", "deliveries", "ppe", "work_hours",
    "restricted_areas", "lifts", "contacts", "safety_rules", "alerts",
}


def _classify_scope(question: str) -> tuple[str, float]:
    q = question.lower()
    for intent in IN_SCOPE_INTENTS:
        if intent.replace("_", " ") in q or intent in q:
            return "in_scope", 0.7
    return "out_of_scope", 0.6


@router.post("", response_model=schemas.ChatResponse, status_code=201)
def ask_listo(payload: schemas.ChatRequest, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    start = time.time()

    # Get or create chat session
    session_id = payload.chat_session_id
    if session_id:
        session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
        if not session:
            session_id = None

    if not session_id:
        session = models.ChatSession(
            project_id=payload.project_id,
            user_id=payload.user_id,
            device_session_id=payload.device_session_id,
            preferred_language=payload.preferred_language,
            trade_company=payload.trade_company,
            role_label=payload.role_label,
        )
        db.add(session)
        db.flush()

    scope, confidence = _classify_scope(payload.question)

    if scope == "in_scope":
        answer = (
            "I'm looking into that for you. "
            "Please check the site context or ask your superintendent for the latest information."
        )
    else:
        answer = SCOPE_RESPONSE

    elapsed_ms = int((time.time() - start) * 1000)

    interaction = models.ChatInteraction(
        project_id=payload.project_id,
        chat_session_id=session.id,
        user_id=payload.user_id,
        device_session_id=payload.device_session_id,
        trade_company=payload.trade_company,
        role_label=payload.role_label,
        original_language=payload.preferred_language,
        question_original=payload.question,
        question_en=payload.question if payload.preferred_language == "en" else None,
        answer_original=answer,
        answer_en=answer if payload.preferred_language == "en" else None,
        scope_classification=scope,
        scope_confidence=confidence,
        response_time_ms=elapsed_ms,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return schemas.ChatResponse(
        answer=answer,
        chat_session_id=session.id,
        interaction_id=interaction.id,
        scope_classification=scope,
        language=payload.preferred_language,
    )
