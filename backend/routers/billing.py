from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import models, schemas, auth, database

router = APIRouter(prefix="/billing", tags=["Billing"])

# --- Invoices ---
@router.post("/invoices/", response_model=schemas.Invoice)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    items_data = invoice.dict().pop("items", [])
    
    db_invoice = models.Invoice(
        patient_id=invoice.patient_id,
        appointment_id=invoice.appointment_id,
        total_amount=invoice.total_amount,
        status=invoice.status,
        due_date=invoice.due_date
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    if items_data:
        for item_data in items_data:
            db_item = models.InvoiceItem(
                invoice_id=db_invoice.id,
                description=item_data["description"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                amount=item_data["amount"]
            )
            db.add(db_item)
        db.commit()
        db.refresh(db_invoice)
        
    return db_invoice

@router.get("/invoices/", response_model=List[schemas.Invoice])
def read_all_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Invoice)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    return query.order_by(models.Invoice.issued_at.desc()).offset(skip).limit(limit).all()

@router.get("/patients/{patient_id}/invoices", response_model=List[schemas.Invoice])
def read_patient_invoices(patient_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Invoice).filter(models.Invoice.patient_id == patient_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    return query.order_by(models.Invoice.issued_at.desc()).all()

@router.get("/invoices/{invoice_id}", response_model=schemas.Invoice)
def read_invoice(invoice_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Invoice).filter(models.Invoice.id == invoice_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    invoice = query.first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put("/invoices/{invoice_id}/status", response_model=schemas.Invoice)
def update_invoice_status(invoice_id: int, status: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Invoice).filter(models.Invoice.id == invoice_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    invoice = query.first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = status
    db.commit()
    db.refresh(invoice)
    return invoice

# --- Payments ---
@router.post("/invoices/{invoice_id}/payments/", response_model=schemas.Payment)
def create_payment(invoice_id: int, payment: schemas.PaymentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Invoice).filter(models.Invoice.id == invoice_id)
    if current_user.branch_id:
        query = query.join(models.Patient).filter(models.Patient.branch_id == current_user.branch_id)
    invoice = query.first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db_payment = models.Payment(
        invoice_id=invoice_id,
        amount_paid=payment.amount_paid,
        payment_method=payment.payment_method,
        payment_date=datetime.utcnow()
    )
    db.add(db_payment)
    
    # Auto-update invoice status based on total payments
    # Calculate sum including the new payment
    total_paid = sum(p.amount_paid for p in invoice.payments) + payment.amount_paid
    if total_paid >= invoice.total_amount:
        invoice.status = "paid"
    elif total_paid > 0:
        invoice.status = "partially_paid"
        
    db.commit()
    db.refresh(db_payment)
    return db_payment
