from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/plans", tags=["plans"])

@router.get("/", response_model=List[schemas.Process])
def read_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[schemas.Process]:
    plans = db.query(models.ManufacturingProcess).offset(skip).limit(limit).all()
    return plans

@router.post("/", response_model=schemas.Process)
def create_plan(plan: schemas.ProcessCreate, db: Session = Depends(get_db)) -> schemas.Process:
    db_plan = models.ManufacturingProcess(**plan.model_dump())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan
