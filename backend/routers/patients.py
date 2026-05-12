from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    patient_data = patient.dict()
    if patient_data.get("branch_id") is None and current_user.branch_id:
        patient_data["branch_id"] = current_user.branch_id
    db_patient = models.Patient(**patient_data)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    # Mock SMS Notification
    print(f"--> [SMS SENT] Dear {db_patient.full_name}, your record has been registered successfully.")
    
    return db_patient

@router.get("/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Patient)
    if current_user.branch_id:
        query = query.filter(models.Patient.branch_id == current_user.branch_id)
    patients = query.offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Patient).filter(models.Patient.id == patient_id)
    if current_user.branch_id:
        query = query.filter(models.Patient.branch_id == current_user.branch_id)
    patient = query.first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: int, patient_update: schemas.PatientCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Patient).filter(models.Patient.id == patient_id)
    if current_user.branch_id:
        query = query.filter(models.Patient.branch_id == current_user.branch_id)
    db_patient = query.first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db_patient.full_name = patient_update.full_name
    db_patient.phone_number = patient_update.phone_number
    db_patient.medical_history = patient_update.medical_history
    
    db.commit()
    db.refresh(db_patient)
    return db_patient
