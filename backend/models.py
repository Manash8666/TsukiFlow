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
