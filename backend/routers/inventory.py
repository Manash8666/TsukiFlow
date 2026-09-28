from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from pydantic import BaseModel

class SKUSchema(BaseModel):
    id: int
    sku_code: str
    product_name: str
    variant: str
    unit_price: float
    stock_quantity: int
    class Config:
        from_attributes = True

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

@router.get("/", response_model=List[schemas.Product])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.post("/", response_model=schemas.Product)
def create_inventory(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/skus", response_model=List[SKUSchema])
def read_skus(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if db.query(models.SKU).count() == 0:
        db.add(models.SKU(sku_code="TSK-SHIRT-M-RED", product_name="Cotton Shirt", variant="Size M, Red", unit_price=25.00, stock_quantity=150))
        db.add(models.SKU(sku_code="TSK-PCM-500", product_name="Paracetamol", variant="500mg Tablet Strip", unit_price=1.20, stock_quantity=5000))
        db.commit()
    return db.query(models.SKU).offset(skip).limit(limit).all()

@router.post("/skus", response_model=SKUSchema)
def create_sku(sku: SKUSchema, db: Session = Depends(get_db)):
    new_sku = models.SKU(
        sku_code=sku.sku_code,
        product_name=sku.product_name,
        variant=sku.variant,
        unit_price=sku.unit_price,
        stock_quantity=sku.stock_quantity
    )
    db.add(new_sku)
    db.commit()
    return new_sku
