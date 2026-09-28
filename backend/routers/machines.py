from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
from pydantic import BaseModel

router = APIRouter(prefix="/api/machines", tags=["machines"])

class MachineSchema(BaseModel):
    id: int
    name: str
    machine_type: str
    status: str
    temperature: float
    vibration: float
    operating_hours: int
    class Config:
        from_attributes = True

@router.get("/", response_model=List[MachineSchema])
def read_machines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    machines = db.query(models.Machine).offset(skip).limit(limit).all()
    return machines
