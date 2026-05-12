from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_appointment = models.Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Appointment)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    appointments = query.offset(skip).limit(limit).all()
    return appointments

@router.get("/{appointment_id}", response_model=schemas.Appointment)
def read_appointment(appointment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Appointment).filter(models.Appointment.id == appointment_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    appointment = query.first()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment
