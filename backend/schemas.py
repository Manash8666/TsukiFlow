from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    inventory_level: int = 0
    item_type: str = "Finished Good"

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

class ProcessBase(BaseModel):
    name: str
    description: Optional[str] = None
    product_id: Optional[int] = None
    quantity: int
    status: str = "Planned"
    start_date: str
    end_date: str

class ProcessCreate(ProcessBase):
    pass

class Process(ProcessBase):
    id: int
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    description: str
    process_id: Optional[int] = None
    user_id: Optional[int] = None
    status: str = "Pending"

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    class Config:
        from_attributes = True

class DowntimeLogBase(BaseModel):
    machine_id: int
    reason: str
    duration_minutes: int = 0
    timestamp: str

class DowntimeLogCreate(DowntimeLogBase):
    pass

class DowntimeLog(DowntimeLogBase):
    id: int
    class Config:
        from_attributes = True

class GRNBase(BaseModel):
    po_id: int
    received_quantity: int
    status: str = "QUARANTINE"
    timestamp: str

class GRNCreate(GRNBase):
    pass

class GRN(GRNBase):
    id: int
    class Config:
        from_attributes = True

class BoMItemBase(BaseModel):
    parent_product_id: int
    child_product_id: int
    quantity_required: float
    stage: str

class BoMItemCreate(BoMItemBase):
    pass

class BoMItemSchema(BoMItemBase):
    id: int
    class Config:
        from_attributes = True


# ==============================================================================
# THE EIGHT MISSING SYSTEMS - SCHEMAS
# ==============================================================================
from typing import List

class WarehouseBase(BaseModel):
    code: str
    name: str
    warehouse_type: str = "RAW_MATERIAL"  # RAW_MATERIAL, WIP_FLOOR, FINISHED_GOODS, SUBCONTRACT_CUSTODY
    location: Optional[str] = None
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseSchema(WarehouseBase):
    id: int
    class Config:
        from_attributes = True


class LotBase(BaseModel):
    lot_number: str
    product_id: int
    sku_id: Optional[int] = None
    parent_lot_id: Optional[int] = None
    lineage_type: str = "NEW"
    initial_quantity: float
    current_quantity: float
    unit_cost: float = 0.0
    status: str = "IN_STOCK"
    barcode: Optional[str] = None

class LotCreate(LotBase):
    pass

class LotSplitRequest(BaseModel):
    parent_lot_id: int
    split_quantity: float
    new_lot_number: Optional[str] = None
    barcode: Optional[str] = None

class LotSchema(LotBase):
    id: int
    created_at: Optional[str] = None
    product_name: Optional[str] = None
    class Config:
        from_attributes = True


class StageStockBase(BaseModel):
    lot_id: int
    stage_name: str
    warehouse_id: int
    processor_name: Optional[str] = None
    quantity: float

class StageStockCreate(StageStockBase):
    pass

class StageStockSchema(StageStockBase):
    id: int
    updated_at: Optional[str] = None
    class Config:
        from_attributes = True


class LotMovementBase(BaseModel):
    lot_id: int
    movement_type: str
    from_warehouse_id: Optional[int] = None
    to_warehouse_id: Optional[int] = None
    stage_name: Optional[str] = None
    issued_qty: float = 0.0
    consumed_qty: float = 0.0
    wastage_qty: float = 0.0
    surplus_qty: float = 0.0
    reference_doc: Optional[str] = None
    unit_cost: float = 0.0
    notes: Optional[str] = None

class LotMovementCreate(LotMovementBase):
    pass

class ConservationCompletionRequest(BaseModel):
    jwo_id: int
    issued_qty: float
    consumed_qty: float
    wastage_qty: float
    surplus_qty: float
    produced_qty: float
    service_cost: float = 0.0
    notes: Optional[str] = None

class LotMovementSchema(LotMovementBase):
    id: int
    timestamp: Optional[str] = None
    class Config:
        from_attributes = True


class RoutingBoMStageItemSchema(BaseModel):
    id: Optional[int] = None
    product_id: int
    product_name: Optional[str] = None
    item_direction: str = "CONSUME"  # CONSUME or PRODUCE
    quantity_per_unit: float = 1.0
    uom: str = "units"
    class Config:
        from_attributes = True

class RoutingBoMStageSchema(BaseModel):
    id: Optional[int] = None
    stage_order: int
    stage_name: str
    default_processor_type: str = "CAPTIVE"  # CAPTIVE, SUBCONTRACT
    default_vendor_name: Optional[str] = None
    standard_process_cost: float = 0.0
    cycle_time_minutes: int = 0
    items: List[RoutingBoMStageItemSchema] = []
    class Config:
        from_attributes = True

class RoutingBoMSchema(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    version: str = "v1.0"
    description: Optional[str] = None
    is_active: bool = True
    stages: List[RoutingBoMStageSchema] = []
    class Config:
        from_attributes = True

class RoutingBoMCreate(BaseModel):
    product_id: int
    version: str = "v1.0"
    description: Optional[str] = None
    stages: List[RoutingBoMStageSchema] = []


class JobWorkOrderCreate(BaseModel):
    stage_name: str
    processor_type: str = "CAPTIVE"
    processor_name: str
    process_id: Optional[int] = None
    target_product_id: Optional[int] = None
    issued_lot_id: int
    issued_quantity: float
    service_rate_per_unit: float = 0.0
    due_date: Optional[str] = None

class JobWorkOrderSchema(BaseModel):
    id: int
    jwo_number: str
    process_id: Optional[int] = None
    stage_name: str
    processor_type: str
    processor_name: str
    target_product_id: Optional[int] = None
    target_lot_id: Optional[int] = None
    issued_lot_id: Optional[int] = None
    issued_quantity: float
    consumed_quantity: float
    wastage_quantity: float
    surplus_quantity: float
    produced_quantity: float
    service_rate_per_unit: float
    total_service_cost: float
    status: str
    is_billed: bool
    due_date: Optional[str] = None
    created_at: Optional[str] = None
    class Config:
        from_attributes = True


class ProcessorBillSchema(BaseModel):
    id: int
    bill_number: str
    jwo_id: Optional[int] = None
    processor_name: str
    bill_type: str
    gross_amount: float
    tax_amount: float
    net_amount: float
    paid_amount: float
    due_amount: float
    status: str
    created_at: Optional[str] = None
    class Config:
        from_attributes = True

class ProcessorBillPaymentRequest(BaseModel):
    bill_id: int
    payment_amount: float
    payment_mode: str = "BANK_TRANSFER"  # CASH, NEFT, RTGS, CHEQUE, UPI


class MRPExplosionRequest(BaseModel):
    product_id: int
    order_quantity: float

class MRPShorfallItem(BaseModel):
    product_id: int
    product_name: str
    required_qty: float
    available_qty: float
    on_po_qty: float
    shortfall_qty: float
    unit_cost: float
    estimated_cost: float
    preferred_vendor: str
    action_ready: bool

class MRPExplosionResponse(BaseModel):
    product_id: int
    product_name: str
    target_order_quantity: float
    total_shortfall_items: int
    total_procurement_cost: float
    shortfalls: List[MRPShorfallItem]

class GenerateShortfallPOsRequest(BaseModel):
    items: List[MRPShorfallItem]

