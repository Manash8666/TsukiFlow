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

class WasteCreate(BaseModel):
    material: str
    quantity_kg: float
    disposal_method: str
    date_logged: str

@router.get("/pos", response_model=List[POSchema])
def read_pos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[models.PurchaseOrder]:
    return db.query(models.PurchaseOrder).offset(skip).limit(limit).all()

@router.get("/waste", response_model=List[WasteSchema])
def read_waste(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[models.WasteLog]:
    return db.query(models.WasteLog).offset(skip).limit(limit).all()

@router.post("/waste", response_model=WasteSchema)
def create_waste(waste: WasteCreate, db: Session = Depends(get_db)) -> models.WasteLog:
    db_waste = models.WasteLog(**waste.model_dump())
    db.add(db_waste)
    db.commit()
    db.refresh(db_waste)
    return db_waste

@router.post("/pos/mock")
def create_mock_po(db: Session = Depends(get_db)) -> dict:
    po = models.PurchaseOrder(po_number="PO-2026-089", vendor_name="Tata Steel", material="Raw Aluminum", quantity=5000, status="Issued")
    db.add(po)
    db.commit()
    return {"message": "Mock PO created"}

from schemas import GRNCreate, GRN

@router.post("/grns", response_model=GRN)
def create_grn(grn: GRNCreate, db: Session = Depends(get_db)) -> GRN:
    db_grn = models.GRN(**grn.model_dump())
    # Update PO status
    po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == grn.po_id).first()
    if po:
        po.status = "GRN Generated"
    db.add(db_grn)
    db.commit()
    db.refresh(db_grn)
    return db_grn
@router.get("/grns", response_model=List[GRN])
def read_grns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[GRN]:
    return db.query(models.GRN).offset(skip).limit(limit).all()

@router.put("/grns/{grn_id}/status", response_model=GRN)
def update_grn_status(grn_id: int, status: str, db: Session = Depends(get_db)) -> GRN:
    db_grn = db.query(models.GRN).filter(models.GRN.id == grn_id).first()
    if db_grn:
        db_grn.status = status
        db.commit()
        db.refresh(db_grn)
    return db_grn
