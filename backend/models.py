from sqlalchemy import Column, ForeignKey, Integer, String, Float, Text, Table, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base

PRODUCT_ID_FK = "products.id"

user_manufacturing_processes = Table(
    'user_manufacturing_processes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('process_id', Integer, ForeignKey('manufacturing_processes.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    
    processes = relationship("ManufacturingProcess", secondary=user_manufacturing_processes, back_populates="users")
    orders = relationship("Order", back_populates="user")
    tasks = relationship("Task", back_populates="assigned_user")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    description = Column(Text)
    price = Column(Float)
    inventory_level = Column(Integer, default=0)
    item_type = Column(String(50), default="Finished Good") # raw material, work in progress, semi-finished, finished good
    
    orders = relationship("Order", back_populates="product")
    processes = relationship("ManufacturingProcess", back_populates="product")

class SKU(Base):
    __tablename__ = "skus"
    id = Column(Integer, primary_key=True, index=True)
    sku_code = Column(String(100), unique=True, index=True)
    product_name = Column(String(100))
    variant = Column(String(100)) # e.g. "Size M, Color Red" or "500mg Tablet"
    unit_price = Column(Float)
    stock_quantity = Column(Integer, default=0)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK))
    quantity = Column(Integer)
    status = Column(String(50), default="pending")
    
    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")

class ManufacturingProcess(Base):
    __tablename__ = "manufacturing_processes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(Text)
    product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK))
    quantity = Column(Integer)
    status = Column(String(50), default="Planned")
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    users = relationship("User", secondary=user_manufacturing_processes, back_populates="processes")
    product = relationship("Product", back_populates="processes")
    tasks = relationship("Task", back_populates="process")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text)
    process_id = Column(Integer, ForeignKey("manufacturing_processes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(50), default="Pending")
    
    process = relationship("ManufacturingProcess", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")

class YuzuMemory(Base):
    __tablename__ = "yuzu_memory"
    id = Column(Integer, primary_key=True, index=True)
    fact = Column(Text, index=True)
    timestamp = Column(DateTime(timezone=True))

class Machine(Base):
    __tablename__ = "machines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    machine_type = Column(String(100))
    status = Column(String(50), default="Operational")
    temperature = Column(Float, default=45.0)
    vibration = Column(Float, default=1.2)
    operating_hours = Column(Integer, default=0)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True)
    vendor_name = Column(String(100))
    material = Column(String(100))
    quantity = Column(Integer)
    status = Column(String(50), default="Issued") # Issued, Goods Receipt Generated, Paid

class GRN(Base):
    __tablename__ = "grns"
    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"))
    received_quantity = Column(Integer)
    status = Column(String(50), default="QUARANTINE") # QUARANTINE, APPROVED, REJECTED
    timestamp = Column(DateTime(timezone=True))
    
    po = relationship("PurchaseOrder", backref="grns")

class WasteLog(Base):
    __tablename__ = "waste_logs"
    id = Column(Integer, primary_key=True, index=True)
    material = Column(String(100))
    quantity_kg = Column(Float)
    disposal_method = Column(String(100)) # Recycled, Sold as Scrap, Discarded
    date_logged = Column(DateTime(timezone=True))

class BillOfMaterial(Base):
    __tablename__ = "boms"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100))
    components = Column(Text) 
    total_cost = Column(Float)

class BoMItem(Base):
    __tablename__ = "bom_items"
    id = Column(Integer, primary_key=True, index=True)
    parent_product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK))
    child_product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK))
    quantity_required = Column(Float)
    stage = Column(String(50)) # e.g. "Semi-Finished 1", "Final Assembly"
    
    parent_product = relationship("Product", foreign_keys=[parent_product_id])
    child_product = relationship("Product", foreign_keys=[child_product_id])

class DowntimeLog(Base):
    __tablename__ = "downtime_logs"
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))
    reason = Column(String(100)) # Setup, Machine Fault, Material Shortage
    duration_minutes = Column(Integer, default=0)
    timestamp = Column(DateTime(timezone=True))
    
    machine = relationship("Machine", backref="downtimes")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(100))
    amount = Column(Float)
    status = Column(String(50), default="Unpaid")
    sow_reference = Column(String(100))

class CustomWorkflow(Base):
    __tablename__ = "custom_workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    stages = Column(Text) 


# ==============================================================================
# THE EIGHT MISSING SYSTEMS - CORE SPINE & MRP MODELS
# ==============================================================================

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(100))
    warehouse_type = Column(String(50))  # RAW_MATERIAL, WIP_FLOOR, FINISHED_GOODS, SUBCONTRACT_CUSTODY
    location = Column(String(200))
    is_active = Column(Boolean, default=True)


class Lot(Base):
    __tablename__ = "lots"
    id = Column(Integer, primary_key=True, index=True)
    lot_number = Column(String(100), unique=True, index=True)
    parent_lot_id = Column(Integer, ForeignKey("lots.id"), nullable=True)
    product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK), nullable=False)
    sku_id = Column(Integer, ForeignKey("skus.id"), nullable=True)
    lineage_type = Column(String(50), default="NEW")  # NEW (from GRN), SPLIT, DERIVED (from JWO)
    initial_quantity = Column(Float, default=0.0)
    current_quantity = Column(Float, default=0.0)
    unit_cost = Column(Float, default=0.0)
    status = Column(String(50), default="IN_STOCK")  # IN_STOCK, IN_PROCESS, EXHAUSTED, QUARANTINE
    barcode = Column(String(100), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True))

    product = relationship("Product", foreign_keys=[product_id])
    sku = relationship("SKU", foreign_keys=[sku_id])
    parent_lot = relationship("Lot", remote_side=[id], backref="child_lots")


class StageStock(Base):
    __tablename__ = "stage_stocks"
    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=False)
    stage_name = Column(String(100), index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    processor_name = Column(String(100))  # Captive Line 1 or Subcontractor Vendor (e.g. Mahesh Cutter)
    quantity = Column(Float, default=0.0)
    updated_at = Column(DateTime(timezone=True))

    lot = relationship("Lot")
    warehouse = relationship("Warehouse")


class LotMovement(Base):
    """
    Immutable Double-Entry Ledger enforcing the Conservation Invariant:
    issued_qty == consumed_qty + wastage_qty + surplus_qty
    Surplus is NOT waste; it sits as a recoverable stock pool.
    """
    __tablename__ = "lot_movements"
    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=False)
    movement_type = Column(String(50), index=True)  # GRN_RECEIPT, JWO_ISSUE, JWO_COMPLETION, STAGE_TRANSFER, SURPLUS_RETURN
    from_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    to_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    stage_name = Column(String(100), nullable=True)
    issued_qty = Column(Float, default=0.0)
    consumed_qty = Column(Float, default=0.0)
    wastage_qty = Column(Float, default=0.0)
    surplus_qty = Column(Float, default=0.0)
    reference_doc = Column(String(100), index=True)  # PO-001, JWO-001, GRN-001
    unit_cost = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True))
    notes = Column(Text, nullable=True)

    lot = relationship("Lot")
    from_warehouse = relationship("Warehouse", foreign_keys=[from_warehouse_id])
    to_warehouse = relationship("Warehouse", foreign_keys=[to_warehouse_id])


class RoutingBoM(Base):
    __tablename__ = "routing_boms"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK), nullable=False)
    version = Column(String(50), default="v1.0")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    product = relationship("Product")
    stages = relationship("RoutingBoMStage", back_populates="routing_bom", cascade="all, delete-orphan")


class RoutingBoMStage(Base):
    __tablename__ = "routing_bom_stages"
    id = Column(Integer, primary_key=True, index=True)
    routing_bom_id = Column(Integer, ForeignKey("routing_boms.id"), nullable=False)
    stage_order = Column(Integer, default=1)
    stage_name = Column(String(100), nullable=False)
    default_processor_type = Column(String(50), default="CAPTIVE")  # CAPTIVE, SUBCONTRACT
    default_vendor_name = Column(String(100), nullable=True)
    standard_process_cost = Column(Float, default=0.0)
    cycle_time_minutes = Column(Integer, default=0)

    routing_bom = relationship("RoutingBoM", back_populates="stages")
    items = relationship("RoutingBoMStageItem", back_populates="stage", cascade="all, delete-orphan")


class RoutingBoMStageItem(Base):
    __tablename__ = "routing_bom_stage_items"
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("routing_bom_stages.id"), nullable=False)
    product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK), nullable=False)
    item_direction = Column(String(20), default="CONSUME")  # CONSUME or PRODUCE
    quantity_per_unit = Column(Float, default=1.0)
    uom = Column(String(20), default="units")

    stage = relationship("RoutingBoMStage", back_populates="items")
    product = relationship("Product")


class JobWorkOrder(Base):
    __tablename__ = "job_work_orders"
    id = Column(Integer, primary_key=True, index=True)
    jwo_number = Column(String(100), unique=True, index=True)
    process_id = Column(Integer, ForeignKey("manufacturing_processes.id"), nullable=True)
    stage_name = Column(String(100), nullable=False)
    processor_type = Column(String(50), default="CAPTIVE")  # CAPTIVE, SUBCONTRACT
    processor_name = Column(String(100), nullable=False)  # Line 1 or Vendor Name (e.g. Mahesh Cutter)
    target_product_id = Column(Integer, ForeignKey(PRODUCT_ID_FK), nullable=True)
    target_lot_id = Column(Integer, ForeignKey("lots.id"), nullable=True)
    issued_lot_id = Column(Integer, ForeignKey("lots.id"), nullable=True)
    issued_quantity = Column(Float, default=0.0)
    consumed_quantity = Column(Float, default=0.0)
    wastage_quantity = Column(Float, default=0.0)
    surplus_quantity = Column(Float, default=0.0)
    produced_quantity = Column(Float, default=0.0)
    service_rate_per_unit = Column(Float, default=0.0)
    total_service_cost = Column(Float, default=0.0)
    status = Column(String(50), default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    is_billed = Column(Boolean, default=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True))

    target_product = relationship("Product", foreign_keys=[target_product_id])
    target_lot = relationship("Lot", foreign_keys=[target_lot_id])
    issued_lot = relationship("Lot", foreign_keys=[issued_lot_id])


class ProcessorBill(Base):
    __tablename__ = "processor_bills"
    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(100), unique=True, index=True)
    jwo_id = Column(Integer, ForeignKey("job_work_orders.id"), nullable=True)
    processor_name = Column(String(100), nullable=False)
    bill_type = Column(String(50), default="SERVICE_BILL")  # SERVICE_BILL (JRN), GOODS_BILL (PO)
    gross_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    net_amount = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    due_amount = Column(Float, default=0.0)
    status = Column(String(50), default="UNPAID")  # UNPAID, PARTIALLY_PAID, PAID
    created_at = Column(DateTime(timezone=True))

