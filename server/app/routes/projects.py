from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[schemas.ProjectRead])
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).filter(models.Project.status != "archived").all()


@router.post("", response_model=schemas.ProjectRead, status_code=201)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Project).filter(models.Project.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="Slug already in use")
    project = models.Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{slug}", response_model=schemas.ProjectRead)
def get_project(slug: str, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
