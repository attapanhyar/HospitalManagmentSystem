from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy & Inventory"])

# --- Inventory ---
@router.post("/inventory/", response_model=schemas.InventoryItem)
def create_inventory_item(item: schemas.InventoryItemCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    item_data = item.dict()
    if not item_data.get("branch_id") and current_user.branch_id:
        item_data["branch_id"] = current_user.branch_id
        
    db_item = models.InventoryItem(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/inventory/", response_model=List[schemas.InventoryItem])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.InventoryItem)
    if current_user.branch_id:
        query = query.filter(models.InventoryItem.branch_id == current_user.branch_id)
    return query.offset(skip).limit(limit).all()

# --- Dispensation ---
@router.post("/dispense/{prescription_id}")
def dispense_prescription(prescription_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    prescription = db.query(models.Prescription).filter(models.Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if prescription.is_dispensed:
        raise HTTPException(status_code=400, detail="Prescription already dispensed")
        
    # Mark as dispensed
    prescription.is_dispensed = True
    
    # Record dispensation
    dispensation = models.PharmacyDispensation(
        prescription_id=prescription_id,
        dispensed_by=current_user.id
    )
    db.add(dispensation)
    db.commit()
    db.refresh(prescription)
    
    return {"message": "Prescription dispensed successfully"}
