from sqlalchemy import Column, ForeignKey, Integer, String, Float, Text, Table
from sqlalchemy.orm import relationship
from database import Base

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
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    status = Column(String(50), default="pending")
    
    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")

class ManufacturingProcess(Base):
    __tablename__ = "manufacturing_processes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(Text)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    status = Column(String(50), default="Planned")
    start_date = Column(String(50))
    end_date = Column(String(50))
    
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
    timestamp = Column(String(50))

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
    status = Column(String(50), default="Issued") # Issued, GRN Generated, Paid

class WasteLog(Base):
    __tablename__ = "waste_logs"
    id = Column(Integer, primary_key=True, index=True)
    material = Column(String(100))
    quantity_kg = Column(Float)
    disposal_method = Column(String(100)) # Recycled, Sold as Scrap, Discarded
    date_logged = Column(String(50))

class BillOfMaterial(Base):
    __tablename__ = "boms"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100))
    components = Column(Text) 
    total_cost = Column(Float)

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
