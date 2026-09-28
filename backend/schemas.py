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
