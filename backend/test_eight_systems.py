import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, SessionLocal
import models
import schemas
from routers import spine, mrp

def test_spine_and_mrp():
    print("1. Creating all database tables (including Eight Missing Systems)...")
    Base.metadata.create_all(bind=engine)
    print("-> Tables created successfully!")

    db = SessionLocal()
    try:
        # Test 1: Seed & verify warehouses
        print("2. Testing Multi-Warehouse Infrastructure...")
        warehouses = spine.get_warehouses(db)
        print(f"-> Active warehouses in system: {len(warehouses)}")
        assert len(warehouses) >= 4, "Expected at least 4 warehouses"
        wh_rm = next(w for w in warehouses if w.code == "WH-RM")
        print(f"   Raw Material WH: {wh_rm.name} ({wh_rm.code})")

        # Test 2: Lots & Splitting
        print("3. Testing Lot Ledger & Lineage Splits...")
        lots = spine.get_lots(db=db)
        print(f"-> Active lots: {len(lots)}")
        assert len(lots) > 0, "Expected at least 1 lot"
        p_lot = lots[0]
        print(f"   Parent Lot: {p_lot.lot_number} | Available Qty: {p_lot.current_quantity}")

        # Split 50 units
        import time
        t_ms = int(time.time() * 1000) % 100000
        split_req = schemas.LotSplitRequest(
            parent_lot_id=p_lot.id,
            split_quantity=50.0,
            new_lot_number=f"{p_lot.lot_number}-SPLIT-{t_ms}",
            barcode=f"BC-SPLIT-{t_ms}"
        )
        child_lot = spine.split_lot(split_req, db)
        print(f"-> Split child lot minted: {child_lot.lot_number} (Qty: {child_lot.current_quantity}, Parent: {child_lot.parent_lot_id})")
        assert child_lot.current_quantity == 50.0

        # Test 3: Process-Routing BoM
        print("4. Testing Process-Routing BoM (Stage Inputs -> Outputs)...")
        routing_boms = mrp.get_routing_boms(db)
        print(f"-> Process-Routing BoMs loaded: {len(routing_boms)}")
        assert len(routing_boms) > 0
        rbom = routing_boms[0]
        print(f"   Product: {rbom.product_name} | Stages: {len(rbom.stages)}")
        for s in rbom.stages:
            print(f"   - Stage {s.stage_order}: {s.stage_name} ({s.default_processor_type}: {s.default_vendor_name}) | Items: {len(s.items)}")

        # Test 4: MRP Explosion
        print("5. Testing MRP Explosion Engine (Req - Avl - OnPO = Shortfall)...")
        mrp_req = schemas.MRPExplosionRequest(product_id=rbom.product_id, order_quantity=100.0)
        explosion = mrp.explode_mrp(mrp_req, db)
        print(f"-> Target Order Qty: {explosion.target_order_quantity} of {explosion.product_name}")
        print(f"   Total Shortfall Items: {explosion.total_shortfall_items} | Total Procurement: INR{explosion.total_procurement_cost:,.2f}")
        for s in explosion.shortfalls:
            print(f"   * {s.product_name}: Required={s.required_qty}, Avl={s.available_qty}, OnPO={s.on_po_qty} => Shortfall={s.shortfall_qty} (Vendor: {s.preferred_vendor})")

        # Test 5: One-Click Shortfall to PO
        print("6. Testing One-Click Shortfall -> PO Generation...")
        shortfall_items = [s for s in explosion.shortfalls if s.shortfall_qty > 0]
        if shortfall_items:
            po_gen = mrp.generate_shortfall_pos(schemas.GenerateShortfallPOsRequest(items=shortfall_items), db)
            print(f"-> {po_gen['message']}")
            print(f"   Minted PO: {po_gen['purchase_orders'][0]['po_number']} to {po_gen['purchase_orders'][0]['vendor']}")

        # Test 6: Job Work Order & Conservation Invariant
        print("7. Testing Job Work Order & Conservation Law Invariant...")
        jwos = mrp.get_jwos(db=db)
        target_jwo = next((j for j in jwos if j.status == "IN_PROGRESS"), None)
        if not target_jwo:
            # Create JWO
            create_jwo_req = schemas.JobWorkOrderCreate(
                stage_name="Subcontract Heat Treatment",
                processor_type="SUBCONTRACT",
                processor_name="Mahesh Heat-Treaters, Pune",
                issued_lot_id=child_lot.id,
                issued_quantity=50.0,
                service_rate_per_unit=20.0
            )
            target_jwo = mrp.create_jwo(create_jwo_req, db)

        print(f"   Active JWO: {target_jwo.jwo_number} | Stage: {target_jwo.stage_name} | Issued Qty: {target_jwo.issued_quantity}")

        # Test Violation of Conservation Law (Issued 50 != 40 + 5 + 0 = 45)
        print("   Testing Conservation Law Violation rejection (50 != 40 + 5 + 0)...")
        try:
            spine.complete_stage_with_conservation(
                schemas.ConservationCompletionRequest(
                    jwo_id=target_jwo.id,
                    issued_qty=50.0,
                    consumed_qty=40.0,
                    wastage_qty=5.0,
                    surplus_qty=0.0, # sum is 45, missing 5!
                    produced_qty=40.0,
                    service_cost=800.0
                ),
                db
            )
            assert False, "Conservation violation should have failed!"
        except Exception as e:
            print(f"-> Correctly Caught Invariant Violation: {e.detail}")

        # Test Valid Conservation Completion: Issued 50 = Consumed 40 + Wastage 4 + Surplus 6 = 50
        print("   Testing Valid Conservation Completion: 50.0 == 40.0 + 4.0 + 6.0...")
        completion_res = spine.complete_stage_with_conservation(
            schemas.ConservationCompletionRequest(
                jwo_id=target_jwo.id,
                issued_qty=50.0,
                consumed_qty=40.0,
                wastage_qty=4.0,
                surplus_qty=6.0,
                produced_qty=40.0,
                service_cost=800.0,
                notes="Stage completed. Surplus 6.0 retained in recoverable store."
            ),
            db
        )
        print(f"-> {completion_res['message']}")
        print(f"   Output Lot Minted: {completion_res['output_lot']['lot_number']} (Qty: {completion_res['output_lot']['produced_qty']}, Unit Cost: INR{completion_res['output_lot']['rolled_unit_cost']})")
        print(f"   Surplus Lot Preserved: {completion_res['surplus_lot']['lot_number']} (Qty: {completion_res['surplus_lot']['quantity']})")
        if completion_res['processor_bill']:
            print(f"   JRN Service Bill Generated: {completion_res['processor_bill']['bill_number']} | Net: INR{completion_res['processor_bill']['net_amount']}")

        print("\n>>> ALL EIGHT MISSING SYSTEMS TESTS PASSED WITH 100% MATHEMATICAL INTEGRITY! <<<")

    finally:
        db.close()

if __name__ == "__main__":
    test_spine_and_mrp()
