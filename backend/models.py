from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, Date
from sqlalchemy.orm import relationship
from database import Base
import datetime

# --- Core/Multi-Branch Models ---
class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String)
    is_active = Column(Boolean, default=True)

    users = relationship("User", back_populates="branch")
    patients = relationship("Patient", back_populates="branch")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Admin, Doctor, Receptionist, Pharmacist, LabTech, HR
    is_active = Column(Boolean, default=True)
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="doctors")
    branch = relationship("Branch", back_populates="users")
    appointments = relationship("Appointment", back_populates="doctor")
    consultations = relationship("Consultation", back_populates="doctor")
    employee_profile = relationship("EmployeeProfile", back_populates="user", uselist=False)

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    doctors = relationship("User", back_populates="department")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    full_name = Column(String, index=True)
    phone_number = Column(String, index=True)
    medical_history = Column(Text, nullable=True)
    synced = Column(Boolean, default=True)
    
    branch = relationship("Branch", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient")
    vitals = relationship("Vitals", back_populates="patient")
    consultations = relationship("Consultation", back_populates="patient")
    invoices = relationship("Invoice", back_populates="patient")
    lab_orders = relationship("LabOrder", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    appointment_time = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="scheduled") # scheduled, completed, cancelled
    notes = Column(Text, nullable=True)
    
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("User", back_populates="appointments")
    vitals = relationship("Vitals", back_populates="appointment")
    consultation = relationship("Consultation", back_populates="appointment", uselist=False)
    invoice = relationship("Invoice", back_populates="appointment", uselist=False)

# --- EHR Models ---
class Vitals(Base):
    __tablename__ = "vitals"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    temperature = Column(Float, nullable=True)
    blood_pressure = Column(String, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="vitals")
    appointment = relationship("Appointment", back_populates="vitals")

class Consultation(Base):
    __tablename__ = "consultations"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    subjective = Column(Text, nullable=True)
    objective = Column(Text, nullable=True)
    assessment = Column(Text, nullable=True)
    plan = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    appointment = relationship("Appointment", back_populates="consultation")
    patient = relationship("Patient", back_populates="consultations")
    doctor = relationship("User", back_populates="consultations")
    prescriptions = relationship("Prescription", back_populates="consultation")

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"))
    medication_name = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    duration = Column(String)
    instructions = Column(Text, nullable=True)
    is_dispensed = Column(Boolean, default=False)

    consultation = relationship("Consultation", back_populates="prescriptions")

# --- Billing Models ---
class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    total_amount = Column(Float, default=0.0)
    status = Column(String, default="pending") # pending, partially_paid, paid
    issued_at = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="invoices")
    appointment = relationship("Appointment", back_populates="invoice")
    items = relationship("InvoiceItem", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    description = Column(String)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float)
    amount = Column(Float)

    invoice = relationship("Invoice", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    amount_paid = Column(Float)
    payment_method = Column(String)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payments")

# --- Pharmacy & Inventory ---
class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    name = Column(String, index=True)
    stock_quantity = Column(Integer, default=0)
    unit_price = Column(Float, default=0.0)
    expiry_date = Column(Date, nullable=True)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    supplier_name = Column(String)
    total_cost = Column(Float)
    status = Column(String, default="pending") # pending, received
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PharmacyDispensation(Base):
    __tablename__ = "pharmacy_dispensations"
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"))
    dispensed_by = Column(Integer, ForeignKey("users.id"))
    dispensed_at = Column(DateTime, default=datetime.datetime.utcnow)

# --- Laboratory & Pathology ---
class LabTestCatalog(Base):
    __tablename__ = "lab_test_catalog"
    id = Column(Integer, primary_key=True, index=True)
    test_name = Column(String)
    description = Column(Text, nullable=True)
    price = Column(Float)

class LabOrder(Base):
    __tablename__ = "lab_orders"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    test_id = Column(Integer, ForeignKey("lab_test_catalog.id"))
    status = Column(String, default="pending") # pending, completed
    ordered_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="lab_orders")

class LabResult(Base):
    __tablename__ = "lab_results"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("lab_orders.id"))
    result_data = Column(Text)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

# --- HR & Payroll ---
class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    designation = Column(String)
    base_salary = Column(Float)
    hire_date = Column(Date)
    
    user = relationship("User", back_populates="employee_profile")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    status = Column(String) # present, absent, leave

class PayrollSlip(Base):
    __tablename__ = "payroll_slips"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    month = Column(String) # e.g. "2023-10"
    base_salary = Column(Float)
    bonuses = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float)
    status = Column(String, default="pending") # pending, paid
