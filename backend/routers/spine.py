from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/spine", tags=["spine"])

# ==============================================================================
# 1. WAREHOUSES
# ==============================================================================

@router.get("/warehouses", response_model=List[schemas.WarehouseSchema])
def get_warehouses(db: Session = Depends(get_db)):
    # Auto-seed standard multi-warehouse locations if empty
    if db.query(models.Warehouse).count() == 0:
        default_whs = [
            models.Warehouse(code="WH-RM", name="Raw Material Store", warehouse_type="RAW_MATERIAL", location="Bay A1 - North Wing"),
            models.Warehouse(code="WH-WIP", name="Shop Floor WIP Buffer", warehouse_type="WIP_FLOOR", location="Assembly Line Concourse"),
            models.Warehouse(code="WH-FG", name="Finished Goods Depot", warehouse_type="FINISHED_GOODS", location="Dispatch Bay C - South Wing"),
            models.Warehouse(code="WH-VEND-MAHESH", name="Mahesh Cutter Custody", warehouse_type="SUBCONTRACT_CUSTODY", location="Vendor Yard 4, Surat"),
            models.Warehouse(code="WH-VEND-ROHAN", name="Rohan Dyer Custody", warehouse_type="SUBCONTRACT_CUSTODY", location="Industrial Area Unit 12, Tirupur"),
        ]
        db.add_all(default_whs)
        db.commit()
    return db.query(models.Warehouse).all()


@router.post("/warehouses", response_model=schemas.WarehouseSchema)
def create_warehouse(wh: schemas.WarehouseCreate, db: Session = Depends(get_db)):
    if db.query(models.Warehouse).filter(models.Warehouse.code == wh.code).first():
        raise HTTPException(status_code=400, detail="Warehouse with this code already exists")
    new_wh = models.Warehouse(**wh.model_dump())
    db.add(new_wh)
    db.commit()
    db.refresh(new_wh)
    return new_wh


# ==============================================================================
# 2. LOTS & LOT SPLITTING
# ==============================================================================

@router.get("/lots", response_model=List[schemas.LotSchema])
def get_lots(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Lot)
    if status_filter:
        query = query.filter(models.Lot.status == status_filter)
    
    # Auto-seed initial sample lots if table is empty
    if query.count() == 0:
        products = db.query(models.Product).all()
        p1 = products[0] if products else None
        p2 = products[1] if len(products) > 1 else None
        
        if p1:
            sample_lots = [
                models.Lot(
                    lot_number="LOT-2026-001",
                    product_id=p1.id,
                    lineage_type="NEW",
                    initial_quantity=500.0,
                    current_quantity=450.0,
                    unit_cost=120.0,
                    status="IN_STOCK",
                    barcode="TSK-BC-2026-001",
                    created_at=datetime.now(timezone.utc)
                )
            ]
            if p2:
                sample_lots.append(
                    models.Lot(
                        lot_number="LOT-2026-002",
                        product_id=p2.id,
                        lineage_type="NEW",
                        initial_quantity=1000.0,
                        current_quantity=1000.0,
                        unit_cost=45.0,
                        status="IN_STOCK",
                        barcode="TSK-BC-2026-002",
                        created_at=datetime.now(timezone.utc)
                    )
                )
            db.add_all(sample_lots)
            db.commit()

    lots = query.all()
    results = []
    for l in lots:
        item = schemas.LotSchema(
            id=l.id,
            lot_number=l.lot_number,
            product_id=l.product_id,
            sku_id=l.sku_id,
            parent_lot_id=l.parent_lot_id,
            lineage_type=l.lineage_type,
            initial_quantity=l.initial_quantity,
            current_quantity=l.current_quantity,
            unit_cost=l.unit_cost,
            status=l.status,
            barcode=l.barcode,
            created_at=l.created_at.isoformat() if l.created_at else None,
            product_name=l.product.name if l.product else None
        )
        results.append(item)
    return results


@router.post("/lots", response_model=schemas.LotSchema)
def create_lot(lot: schemas.LotCreate, db: Session = Depends(get_db)):
    if db.query(models.Lot).filter(models.Lot.lot_number == lot.lot_number).first():
        raise HTTPException(status_code=400, detail="Lot number already exists")
    
    new_lot = models.Lot(
        **lot.model_dump(),
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_lot)
    db.commit()
    db.refresh(new_lot)

    # Automatically initialize stock in Raw Material warehouse
    wh_rm = db.query(models.Warehouse).filter(models.Warehouse.code == "WH-RM").first()
    if wh_rm:
        movement = models.LotMovement(
            lot_id=new_lot.id,
            movement_type="GRN_RECEIPT",
            to_warehouse_id=wh_rm.id,
            issued_qty=new_lot.initial_quantity,
            reference_doc=f"GRN-{new_lot.lot_number}",
            unit_cost=new_lot.unit_cost,
            timestamp=datetime.now(timezone.utc),
            notes="Initial receipt lot minted from intake"
        )
        db.add(movement)
        db.commit()

    return schemas.LotSchema(
        id=new_lot.id,
        lot_number=new_lot.lot_number,
        product_id=new_lot.product_id,
        sku_id=new_lot.sku_id,
        parent_lot_id=new_lot.parent_lot_id,
        lineage_type=new_lot.lineage_type,
        initial_quantity=new_lot.initial_quantity,
        current_quantity=new_lot.current_quantity,
        unit_cost=new_lot.unit_cost,
        status=new_lot.status,
        barcode=new_lot.barcode,
        created_at=new_lot.created_at.isoformat() if new_lot.created_at else None,
        product_name=new_lot.product.name if new_lot.product else None
    )


@router.post("/lots/split", response_model=schemas.LotSchema)
def split_lot(request: schemas.LotSplitRequest, db: Session = Depends(get_db)):
    parent_lot = db.query(models.Lot).filter(models.Lot.id == request.parent_lot_id).first()
    if not parent_lot:
        raise HTTPException(status_code=404, detail="Parent lot not found")
    
    if request.split_quantity <= 0:
        raise HTTPException(status_code=400, detail="Split quantity must be greater than zero")
    
    if parent_lot.current_quantity < request.split_quantity:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient lot quantity. Available: {parent_lot.current_quantity}, Requested: {request.split_quantity}"
        )

    # Deduct from parent lot
    parent_lot.current_quantity -= request.split_quantity
    if parent_lot.current_quantity == 0:
        parent_lot.status = "EXHAUSTED"

    # Mint child lot with lineage
    timestamp_suffix = int(datetime.now(timezone.utc).timestamp())
    child_lot_number = request.new_lot_number or f"{parent_lot.lot_number}-S{timestamp_suffix % 1000}"
    child_barcode = request.barcode or f"BC-{child_lot_number}"

    child_lot = models.Lot(
        lot_number=child_lot_number,
        parent_lot_id=parent_lot.id,
        product_id=parent_lot.product_id,
        sku_id=parent_lot.sku_id,
        lineage_type="SPLIT",
        initial_quantity=request.split_quantity,
        current_quantity=request.split_quantity,
        unit_cost=parent_lot.unit_cost,
        status="IN_STOCK",
        barcode=child_barcode,
        created_at=datetime.now(timezone.utc)
    )
    db.add(child_lot)
    db.commit()
    db.refresh(child_lot)

    # Log double-entry movement
    movement = models.LotMovement(
        lot_id=child_lot.id,
        movement_type="LOT_SPLIT",
        issued_qty=request.split_quantity,
        reference_doc=f"SPLIT-FROM-{parent_lot.lot_number}",
        unit_cost=child_lot.unit_cost,
        timestamp=datetime.now(timezone.utc),
        notes=f"Sub-lot split from parent {parent_lot.lot_number}"
    )
    db.add(movement)
    db.commit()

    return schemas.LotSchema(
        id=child_lot.id,
        lot_number=child_lot.lot_number,
        product_id=child_lot.product_id,
        sku_id=child_lot.sku_id,
        parent_lot_id=child_lot.parent_lot_id,
        lineage_type=child_lot.lineage_type,
        initial_quantity=child_lot.initial_quantity,
        current_quantity=child_lot.current_quantity,
        unit_cost=child_lot.unit_cost,
        status=child_lot.status,
        barcode=child_lot.barcode,
        created_at=child_lot.created_at.isoformat() if child_lot.created_at else None,
        product_name=child_lot.product.name if child_lot.product else None
    )


# ==============================================================================
# 3. STAGE STOCKS & LOT MOVEMENTS
# ==============================================================================

@router.get("/stage-stocks", response_model=List[schemas.StageStockSchema])
def get_stage_stocks(db: Session = Depends(get_db)):
    stocks = db.query(models.StageStock).all()
    results = []
    for s in stocks:
        results.append(schemas.StageStockSchema(
            id=s.id,
            lot_id=s.lot_id,
            stage_name=s.stage_name,
            warehouse_id=s.warehouse_id,
            processor_name=s.processor_name,
            quantity=s.quantity,
            updated_at=s.updated_at.isoformat() if s.updated_at else None
        ))
    return results


@router.get("/movements", response_model=List[schemas.LotMovementSchema])
def get_movements(limit: int = 100, db: Session = Depends(get_db)):
    movements = db.query(models.LotMovement).order_by(models.LotMovement.id.desc()).limit(limit).all()
    results = []
    for m in movements:
        results.append(schemas.LotMovementSchema(
            id=m.id,
            lot_id=m.lot_id,
            movement_type=m.movement_type,
            from_warehouse_id=m.from_warehouse_id,
            to_warehouse_id=m.to_warehouse_id,
            stage_name=m.stage_name,
            issued_qty=m.issued_qty,
            consumed_qty=m.consumed_qty,
            wastage_qty=m.wastage_qty,
            surplus_qty=m.surplus_qty,
            reference_doc=m.reference_doc,
            unit_cost=m.unit_cost,
            notes=m.notes,
            timestamp=m.timestamp.isoformat() if m.timestamp else None
        ))
    return results


# ==============================================================================
# 4. THE CONSERVATION INVARIANT ENGINE (The Physical Law)
# ==============================================================================

@router.post("/movements/conservation-complete")
def complete_stage_with_conservation(req: schemas.ConservationCompletionRequest, db: Session = Depends(get_db)):
    """
    Enforces physical conservation of matter:
    issued_qty == consumed_qty + wastage_qty + surplus_qty
    Surplus sits as a recoverable stock bucket.
    Wastage is absorbed mathematically into the unit cost of produced good output.
    """
    jwo = db.query(models.JobWorkOrder).filter(models.JobWorkOrder.id == req.jwo_id).first()
    if not jwo:
        raise HTTPException(status_code=404, detail="Job Work Order not found")

    # 1. Enforce Conservation Check:
    sum_components = round(req.consumed_qty + req.wastage_qty + req.surplus_qty, 4)
    expected_issued = round(req.issued_qty, 4)

    if sum_components != expected_issued:
        delta = round(expected_issued - sum_components, 4)
        raise HTTPException(
            status_code=400,
            detail=(
                f"Conservation Law Violation! "
                f"Issued ({expected_issued}) != Consumed ({req.consumed_qty}) + "
                f"Wastage ({req.wastage_qty}) + Surplus ({req.surplus_qty}) = {sum_components}. "
                f"Discrepancy: {delta:+0.4f} units unaccounted for."
            )
        )

    # 2. Update JWO with reconciled quantities
    jwo.issued_quantity = req.issued_qty
    jwo.consumed_quantity = req.consumed_qty
    jwo.wastage_quantity = req.wastage_qty
    jwo.surplus_quantity = req.surplus_qty
    jwo.produced_quantity = req.produced_qty
    jwo.total_service_cost = req.service_cost
    jwo.status = "COMPLETED"

    # 3. Retrieve Issued Lot to roll progressive costing
    issued_lot = db.query(models.Lot).filter(models.Lot.id == jwo.issued_lot_id).first()
    issued_unit_cost = issued_lot.unit_cost if issued_lot else 50.0

    # Calculate absorbed actual unit cost:
    # Cost = (consumed_qty * issued_unit_cost + wastage_qty * issued_unit_cost + service_cost) / produced_qty
    total_material_cost = (req.consumed_qty + req.wastage_qty) * issued_unit_cost
    total_stage_cost = total_material_cost + req.service_cost
    produced_unit_cost = round(total_stage_cost / req.produced_qty, 2) if req.produced_qty > 0 else issued_unit_cost

    # 4. Mint Output Lot for Produced Intermediate / Finished Goods
    timestamp_str = datetime.now(timezone.utc).strftime("%y%m%d%H%M")
    output_lot_number = f"LOT-PRD-{jwo.stage_name[:3].upper()}-{timestamp_str}"
    target_product_id = jwo.target_product_id or (issued_lot.product_id if issued_lot else 1)

    wh_wip = db.query(models.Warehouse).filter(models.Warehouse.code == "WH-WIP").first()
    wh_fg = db.query(models.Warehouse).filter(models.Warehouse.code == "WH-FG").first()
    dest_wh = wh_fg if "pack" in jwo.stage_name.lower() or "final" in jwo.stage_name.lower() else wh_wip

    output_lot = models.Lot(
        lot_number=output_lot_number,
        parent_lot_id=jwo.issued_lot_id,
        product_id=target_product_id,
        lineage_type="DERIVED",
        initial_quantity=req.produced_qty,
        current_quantity=req.produced_qty,
        unit_cost=produced_unit_cost,
        status="IN_STOCK",
        barcode=f"BC-{output_lot_number}",
        created_at=datetime.now(timezone.utc)
    )
    db.add(output_lot)
    db.commit()
    db.refresh(output_lot)
    jwo.target_lot_id = output_lot.id

    # 5. Handle Recoverable Surplus Lot (Surplus != Waste)
    surplus_lot = None
    if req.surplus_qty > 0 and issued_lot:
        surplus_lot_number = f"SURPLUS-{issued_lot.lot_number}-{timestamp_str[-4:]}"
        wh_rm = db.query(models.Warehouse).filter(models.Warehouse.code == "WH-RM").first()
        surplus_lot = models.Lot(
            lot_number=surplus_lot_number,
            parent_lot_id=issued_lot.id,
            product_id=issued_lot.product_id,
            lineage_type="SPLIT",
            initial_quantity=req.surplus_qty,
            current_quantity=req.surplus_qty,
            unit_cost=issued_unit_cost,
            status="IN_STOCK",
            barcode=f"BC-{surplus_lot_number}",
            created_at=datetime.now(timezone.utc)
        )
        db.add(surplus_lot)
        db.commit()

        # Log Surplus Return to RM Store
        db.add(models.LotMovement(
            lot_id=surplus_lot.id,
            movement_type="SURPLUS_RECOVERY",
            from_warehouse_id=wh_wip.id if wh_wip else None,
            to_warehouse_id=wh_rm.id if wh_rm else None,
            stage_name=jwo.stage_name,
            surplus_qty=req.surplus_qty,
            reference_doc=jwo.jwo_number,
            unit_cost=issued_unit_cost,
            timestamp=datetime.now(timezone.utc),
            notes=f"Recoverable surplus material returned to store from JWO {jwo.jwo_number}"
        ))

    # 6. Record JWO Completion Invariant Movement
    db.add(models.LotMovement(
        lot_id=output_lot.id,
        movement_type="JWO_COMPLETION",
        from_warehouse_id=wh_wip.id if wh_wip else None,
        to_warehouse_id=dest_wh.id if dest_wh else None,
        stage_name=jwo.stage_name,
        issued_qty=req.issued_qty,
        consumed_qty=req.consumed_qty,
        wastage_qty=req.wastage_qty,
        surplus_qty=req.surplus_qty,
        reference_doc=jwo.jwo_number,
        unit_cost=produced_unit_cost,
        timestamp=datetime.now(timezone.utc),
        notes=f"Stage {jwo.stage_name} closed. Conservation verified: {req.issued_qty} = {req.consumed_qty} + {req.wastage_qty} + {req.surplus_qty}"
    ))

    # 7. Generate Processor Bill (JRN Service Bill) for Subcontractor
    bill = None
    if jwo.processor_type == "SUBCONTRACT" and req.service_cost > 0:
        bill_number = f"JRN-{jwo.jwo_number}-{timestamp_str[-4:]}"
        tax = round(req.service_cost * 0.18, 2)  # 18% GST standard on job work services
        net = round(req.service_cost + tax, 2)
        bill = models.ProcessorBill(
            bill_number=bill_number,
            jwo_id=jwo.id,
            processor_name=jwo.processor_name,
            bill_type="SERVICE_BILL",
            gross_amount=req.service_cost,
            tax_amount=tax,
            net_amount=net,
            paid_amount=0.0,
            due_amount=net,
            status="UNPAID",
            created_at=datetime.now(timezone.utc)
        )
        db.add(bill)
        jwo.is_billed = True

    db.commit()

    return {
        "status": "success",
        "message": "Stage completion verified under Conservation Law. Matter accounted for.",
        "jwo_number": jwo.jwo_number,
        "conservation_check": {
            "issued_qty": req.issued_qty,
            "consumed_qty": req.consumed_qty,
            "wastage_qty": req.wastage_qty,
            "surplus_qty": req.surplus_qty,
            "balanced": True
        },
        "output_lot": {
            "id": output_lot.id,
            "lot_number": output_lot.lot_number,
            "produced_qty": output_lot.initial_quantity,
            "rolled_unit_cost": produced_unit_cost
        },
        "surplus_lot": {
            "id": surplus_lot.id,
            "lot_number": surplus_lot.lot_number,
            "quantity": surplus_lot.initial_quantity
        } if surplus_lot else None,
        "processor_bill": {
            "bill_number": bill.bill_number,
            "processor": bill.processor_name,
            "net_amount": bill.net_amount
        } if bill else None
    }
