from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
from pydantic import BaseModel
import json
import httpx
import os
from fastapi import HTTPException

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

class WorkflowSchema(BaseModel):
    id: int
    name: str
    stages: str
    class Config:
        from_attributes = True

class GenerateBOMRequest(BaseModel):
    product_name: str

class ManualBOMRequest(BaseModel):
    product_name: str
    components: str
    total_cost: float

@router.get("/boms", response_model=List[BOMSchema])
def read_boms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if db.query(models.BillOfMaterial).count() == 0:
        db.add(models.BillOfMaterial(product_name="V8 Engine Block", components=json.dumps({"Aluminum (kg)": 150, "Steel Bolts (units)": 45}), total_cost=2450.00))
        db.commit()
    return db.query(models.BillOfMaterial).offset(skip).limit(limit).all()

@router.get("/invoices", response_model=List[InvoiceSchema])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if db.query(models.Invoice).count() == 0:
        db.add(models.Invoice(client_name="Tata Motors", amount=150000.00, status="Paid", sow_reference="SOW-TM-2026-A1"))
        db.add(models.Invoice(client_name="Mahindra Aerospace", amount=85000.00, status="Unpaid", sow_reference="SOW-MA-2026-B9"))
        db.commit()
    return db.query(models.Invoice).offset(skip).limit(limit).all()

@router.get("/workflows", response_model=List[WorkflowSchema])
def read_workflows(db: Session = Depends(get_db)):
    if db.query(models.CustomWorkflow).count() == 0:
        db.add(models.CustomWorkflow(name="Default Workflow", stages=json.dumps(['Procurement', 'Milling', 'Assembly', 'QA', 'Storage'])))
        db.commit()
    return db.query(models.CustomWorkflow).all()

@router.post("/workflows")
def update_workflow(workflow: dict, db: Session = Depends(get_db)):
    wf = db.query(models.CustomWorkflow).first()
    wf.stages = json.dumps(workflow.get("stages", []))
    db.commit()
    return wf

@router.post("/boms/generate")
async def generate_ai_bom(request: GenerateBOMRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("AGENT_ROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI API key not configured")
        
    system_prompt = (
        "You are an elite Manufacturing AI. The user will provide a product name (e.g., Electric Vehicle Battery, Cotton Shirt, Injection Molded Toy). "
        "Your job is to generate a highly detailed Bill of Materials (BoM) mapped to the minutest details for that specific industry. "
        "You MUST return ONLY a raw JSON object in this exact format: "
        "{\"components\": {\"Material 1\": qty, \"Material 2\": qty, ...}, \"total_cost\": estimated_usd_number}. "
        "Do not include markdown blocks, just the raw JSON."
    )
    
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate a detailed BoM for: {request.product_name}"}
        ]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post("https://api.agentrouter.com/v1/chat/completions", headers={"Authorization": f"Bearer {api_key}"}, json=payload, timeout=30.0)
            res.raise_for_status()
            data = res.json()
            bom_json = json.loads(data["choices"][0]["message"]["content"].replace('```json', '').replace('```', '').strip())
            
            new_bom = models.BillOfMaterial(
                product_name=request.product_name,
                components=json.dumps(bom_json["components"]),
                total_cost=float(bom_json["total_cost"])
            )
            db.add(new_bom)
            db.commit()
            return new_bom
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/boms/manual", response_model=BOMSchema)
def create_manual_bom(request: ManualBOMRequest, db: Session = Depends(get_db)):
    new_bom = models.BillOfMaterial(
        product_name=request.product_name,
        components=request.components,
        total_cost=request.total_cost
    )
    db.add(new_bom)
    db.commit()
    return new_bom
