from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(tags=["reports"])


@router.post("/api/projects/{project_id}/reports", response_model=schemas.IssueReportRead, status_code=201)
def create_report(
    project_id: UUID,
    payload: schemas.IssueReportCreate,
    db: Session = Depends(get_db),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    report = models.IssueReport(project_id=project_id, **payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/api/projects/{project_id}/reports", response_model=list[schemas.IssueReportRead])
def list_reports(project_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(models.IssueReport)
        .filter(models.IssueReport.project_id == project_id)
        .order_by(models.IssueReport.created_at.desc())
        .all()
    )
