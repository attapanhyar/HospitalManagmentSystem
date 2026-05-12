from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/ehr", tags=["EHR"])

# --- Vitals ---
@router.post("/vitals/", response_model=schemas.Vitals)
def create_vitals(vitals: schemas.VitalsCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_vitals = models.Vitals(**vitals.dict())
    db.add(db_vitals)
    db.commit()
    db.refresh(db_vitals)
    return db_vitals

@router.get("/patients/{patient_id}/vitals", response_model=List[schemas.Vitals])
def read_patient_vitals(patient_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Vitals).filter(models.Vitals.patient_id == patient_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    return query.order_by(models.Vitals.recorded_at.desc()).all()

# --- Consultations ---
@router.post("/consultations/", response_model=schemas.Consultation)
def create_consultation(consultation: schemas.ConsultationCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Extract prescriptions if any
    prescriptions_data = consultation.dict().pop("prescriptions", [])
    
    db_consultation = models.Consultation(
        appointment_id=consultation.appointment_id,
        patient_id=consultation.patient_id,
        doctor_id=consultation.doctor_id,
        subjective=consultation.subjective,
        objective=consultation.objective,
        assessment=consultation.assessment,
        plan=consultation.plan
    )
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    
    if prescriptions_data:
        for p_data in prescriptions_data:
            db_prescription = models.Prescription(
                consultation_id=db_consultation.id,
                medication_name=p_data["medication_name"],
                dosage=p_data["dosage"],
                frequency=p_data["frequency"],
                duration=p_data["duration"],
                instructions=p_data.get("instructions")
            )
            db.add(db_prescription)
        db.commit()
        db.refresh(db_consultation)
        
    return db_consultation

@router.get("/patients/{patient_id}/consultations", response_model=List[schemas.Consultation])
def read_patient_consultations(patient_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Consultation).filter(models.Consultation.patient_id == patient_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    return query.order_by(models.Consultation.created_at.desc()).all()

# --- Prescriptions ---
@router.post("/prescriptions/", response_model=schemas.Prescription)
def create_prescription(prescription: schemas.PrescriptionCreate, consultation_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_prescription = models.Prescription(**prescription.dict(), consultation_id=consultation_id)
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription
