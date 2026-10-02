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
