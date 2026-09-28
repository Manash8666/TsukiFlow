from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
from pydantic import BaseModel
import json

router = APIRouter(prefix="/api/engineering", tags=["engineering"])

class BOMSchema(BaseModel):
    id: int
    product_name: str
    components: str
    total_cost: float
    class Config:
        from_attributes = True

class InvoiceSchema(BaseModel):
    id: int
    client_name: str
    amount: float
    status: str
    sow_reference: str
    class Config:
        from_attributes = True

@router.get("/boms", response_model=List[BOMSchema])
def read_boms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Mock data injection if empty for demo purposes
    if db.query(models.BillOfMaterial).count() == 0:
        db.add(models.BillOfMaterial(product_name="V8 Engine Block", components=json.dumps({"Aluminum (kg)": 150, "Steel Bolts (units)": 45}), total_cost=2450.00))
        db.commit()
    return db.query(models.BillOfMaterial).offset(skip).limit(limit).all()

@router.get("/invoices", response_model=List[InvoiceSchema])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Mock data injection if empty for demo purposes
    if db.query(models.Invoice).count() == 0:
        db.add(models.Invoice(client_name="Tata Motors", amount=150000.00, status="Paid", sow_reference="SOW-TM-2026-A1"))
        db.add(models.Invoice(client_name="Mahindra Aerospace", amount=85000.00, status="Unpaid", sow_reference="SOW-MA-2026-B9"))
        db.commit()
    return db.query(models.Invoice).offset(skip).limit(limit).all()
