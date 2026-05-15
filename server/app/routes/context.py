from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(tags=["context"])


@router.get("/api/projects/{project_id}/context", response_model=list[schemas.ContextItemRead])
def list_context(
    project_id: UUID,
    include_drafts: bool = Query(False),
    db: Session = Depends(get_db),
):
    q = db.query(models.ContextItem).filter(models.ContextItem.project_id == project_id)
    if not include_drafts:
        q = q.filter(models.ContextItem.is_active == True)
    return q.order_by(models.ContextItem.priority.desc()).all()


@router.post("/api/projects/{project_id}/context", response_model=schemas.ContextItemRead, status_code=201)
def create_context_item(
    project_id: UUID,
    payload: schemas.ContextItemCreate,
    db: Session = Depends(get_db),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    item = models.ContextItem(project_id=project_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/api/context/{context_item_id}", response_model=schemas.ContextItemRead)
def update_context_item(
    context_item_id: UUID,
    payload: schemas.ContextItemUpdate,
    db: Session = Depends(get_db),
):
    item = db.query(models.ContextItem).filter(models.ContextItem.id == context_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Context item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item
