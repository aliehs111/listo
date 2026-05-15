from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/worker", tags=["worker"])

QUICK_ACTIONS = [
    "Parking",
    "Site Access & ID",
    "Deliveries",
    "PPE",
    "Work Hours",
    "Restricted Areas",
    "Lifts / Hoists",
    "Contacts",
    "Safety Rules",
]


@router.post("/access")
def worker_access(payload: schemas.WorkerAccessRequest, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.slug == payload.slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"project_id": project.id, "project_name": project.name}


@router.get("/projects/{slug}/home", response_model=schemas.WorkerHomeResponse)
def worker_home(
    slug: str,
    device_session_id: str = None,
    db: Session = Depends(get_db),
):
    project = db.query(models.Project).filter(models.Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc)
    active_alerts = (
        db.query(models.Alert)
        .filter(
            models.Alert.project_id == project.id,
            models.Alert.status == "active",
            models.Alert.deleted_at == None,
            models.Alert.starts_at <= now,
        )
        .filter(
            (models.Alert.expires_at == None) | (models.Alert.expires_at > now)
        )
        .all()
    )

    required_unacknowledged = []
    for alert in active_alerts:
        if not alert.requires_acknowledgement:
            continue
        # Check if this device has already acknowledged
        ack = None
        if device_session_id:
            from uuid import UUID as PyUUID
            try:
                ds_uuid = PyUUID(device_session_id)
                ack = (
                    db.query(models.AlertAcknowledgement)
                    .filter(
                        models.AlertAcknowledgement.alert_id == alert.id,
                        models.AlertAcknowledgement.device_session_id == ds_uuid,
                    )
                    .first()
                )
            except ValueError:
                pass
        if not ack:
            required_unacknowledged.append(alert)

    return schemas.WorkerHomeResponse(
        project=project,
        active_alerts=active_alerts,
        required_unacknowledged_alerts=required_unacknowledged,
        quick_actions=QUICK_ACTIONS,
    )
