from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(tags=["alerts"])


def _active_alerts_query(db: Session, project_id: UUID):
    now = datetime.now(timezone.utc)
    return (
        db.query(models.Alert)
        .filter(
            models.Alert.project_id == project_id,
            models.Alert.status == "active",
            models.Alert.deleted_at == None,
            models.Alert.starts_at <= now,
        )
        .filter(
            (models.Alert.expires_at == None) | (models.Alert.expires_at > now)
        )
    )


@router.get("/api/projects/{project_id}/alerts/active", response_model=list[schemas.AlertRead])
def list_active_alerts(project_id: UUID, db: Session = Depends(get_db)):
    return _active_alerts_query(db, project_id).all()


@router.post("/api/projects/{project_id}/alerts", response_model=schemas.AlertRead, status_code=201)
def create_alert(
    project_id: UUID,
    payload: schemas.AlertCreate,
    db: Session = Depends(get_db),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    alert = models.Alert(project_id=project_id, **payload.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/api/alerts/{alert_id}", response_model=schemas.AlertRead)
def update_alert(
    alert_id: UUID,
    payload: schemas.AlertUpdate,
    db: Session = Depends(get_db),
):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(alert, field, value)
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/api/alerts/{alert_id}/acknowledge", status_code=201)
def acknowledge_alert(
    alert_id: UUID,
    payload: schemas.AcknowledgeAlertRequest,
    db: Session = Depends(get_db),
):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    ack = models.AlertAcknowledgement(
        project_id=alert.project_id,
        alert_id=alert_id,
        **payload.model_dump(),
    )
    db.add(ack)
    db.commit()
    return {"acknowledged": True}


@router.post("/api/alerts/{alert_id}/promote-to-context", response_model=schemas.ContextItemRead)
def promote_alert_to_context(
    alert_id: UUID,
    db: Session = Depends(get_db),
):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    context_item = models.ContextItem(
        project_id=alert.project_id,
        category=alert.category or "safety_rules",
        title=alert.title,
        content_original=alert.message_original,
        content_en=alert.message_en,
        content_es=alert.message_es,
        source_language=alert.source_language,
        status="active",
        is_active=True,
    )
    db.add(context_item)
    db.flush()

    alert.status = "promoted_to_context"
    alert.promoted_context_id = context_item.id
    alert.promoted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(context_item)
    return context_item
