from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/supply", tags=["supply"])

class POSchema(BaseModel):
    id: int
    po_number: str
    vendor_name: str
    material: str
    quantity: int
    status: str
    class Config:
        from_attributes = True

class WasteSchema(BaseModel):
    id: int
    material: str
    quantity_kg: float
    disposal_method: str
    date_logged: str
    class Config:
        from_attributes = True

@router.get("/pos", response_model=List[POSchema])
def read_pos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.PurchaseOrder).offset(skip).limit(limit).all()

@router.get("/waste", response_model=List[WasteSchema])
def read_waste(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.WasteLog).offset(skip).limit(limit).all()

@router.post("/pos/mock")
def create_mock_po(db: Session = Depends(get_db)):
    po = models.PurchaseOrder(po_number="PO-2026-089", vendor_name="Tata Steel", material="Raw Aluminum", quantity=5000, status="Issued")
    db.add(po)
    db.commit()
    return {"message": "Mock PO created"}
