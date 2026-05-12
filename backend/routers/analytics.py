from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

import models, auth, database

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Base queries filtered by branch if applicable
    patient_query = db.query(models.Patient)
    appointment_query = db.query(models.Appointment)
    invoice_query = db.query(models.Invoice)
    
    if current_user.branch_id:
        patient_query = patient_query.filter(models.Patient.branch_id == current_user.branch_id)
        appointment_query = appointment_query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
        invoice_query = invoice_query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
        
    total_patients = patient_query.count()
    
    today = date.today()
    # To filter by date, we need to cast datetime to date or use range
    today_start = datetime.combine(today, datetime.min.time())
    
    today_appointments = appointment_query.filter(models.Appointment.appointment_time >= today_start).count()
    
    total_revenue = db.query(func.sum(models.Payment.amount_paid)).join(models.Invoice).join(models.Patient)
    if current_user.branch_id:
        total_revenue = total_revenue.filter(models.Patient.branch_id == current_user.branch_id)
    total_revenue = total_revenue.scalar() or 0.0
    
    return {
        "total_patients": total_patients,
        "today_appointments": today_appointments,
        "total_revenue": total_revenue
    }
