from database import SessionLocal, engine, Base
import models

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(models.Product).first():
        print("Database already seeded.")
        db.close()
        return

    # Products / Inventory
    p1 = models.Product(name="Raw Material Alpha", description="Alpha desc", price=10.0, inventory_level=450)
    p2 = models.Product(name="Component Beta", description="Beta desc", price=15.0, inventory_level=120)
    p3 = models.Product(name="Packaging Gamma", description="Gamma desc", price=5.0, inventory_level=50)
    p4 = models.Product(name="Chemical Delta", description="Delta desc", price=25.0, inventory_level=890)
    db.add_all([p1, p2, p3, p4])
    db.commit()

    # Manufacturing Processes
    m1 = models.ManufacturingProcess(name="Build Alpha", product_id=p1.id, quantity=500, status="In Progress", start_date="2026-10-01", end_date="2026-10-05")
    m2 = models.ManufacturingProcess(name="Assemble Beta", product_id=p2.id, quantity=1200, status="Planned", start_date="2026-10-06", end_date="2026-10-15")
    db.add_all([m1, m2])
    db.commit()

    # Tasks (Quality Control)
    t1 = models.Task(description="Inspection for Widget A", process_id=m1.id, status="Passed")
    t2 = models.Task(description="Inspection for Gadget B", process_id=m2.id, status="Failed")
    db.add_all([t1, t2])
    db.commit()
    
    print("Database seeded successfully.")
    db.close()

if __name__ == "__main__":
    seed_db()
