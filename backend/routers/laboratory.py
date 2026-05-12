from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/laboratory", tags=["Laboratory & Pathology"])

# --- Catalog ---
@router.post("/catalog/", response_model=schemas.LabTestCatalog)
def create_test_catalog(catalog: schemas.LabTestCatalogCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_catalog = models.LabTestCatalog(**catalog.dict())
    db.add(db_catalog)
    db.commit()
    db.refresh(db_catalog)
    return db_catalog

@router.get("/catalog/", response_model=List[schemas.LabTestCatalog])
def read_catalog(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.LabTestCatalog).offset(skip).limit(limit).all()

# --- Orders ---
@router.post("/orders/", response_model=schemas.LabOrder)
def create_lab_order(order: schemas.LabOrderCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_order = models.LabOrder(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders/", response_model=List[schemas.LabOrder])
def read_lab_orders(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.LabOrder)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    return query.order_by(models.LabOrder.ordered_at.desc()).offset(skip).limit(limit).all()

@router.put("/orders/{order_id}/status", response_model=schemas.LabOrder)
def update_lab_order_status(order_id: int, status: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.LabOrder).filter(models.LabOrder.id == order_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    order = query.first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Lab Order not found")
        
    order.status = status
    db.commit()
    db.refresh(order)
    return order
