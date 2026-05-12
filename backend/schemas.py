from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class BranchBase(BaseModel):
    name: str
    location: str
    is_active: bool = True

class BranchCreate(BranchBase):
    pass

class Branch(BranchBase):
    id: int
    class Config:
        from_attributes = True

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    role: str
    branch_id: Optional[int] = None
    department_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    full_name: str
    phone_number: str = Field(..., pattern=r"^(03|\+923)[0-9]{9}$")
    medical_history: Optional[str] = None
    synced: bool = True
    branch_id: Optional[int] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_time: Optional[datetime] = None
    status: str = "scheduled"
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- EHR Schemas ---

class VitalsBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    temperature: Optional[float] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    weight: Optional[float] = None

class VitalsCreate(VitalsBase):
    pass

class Vitals(VitalsBase):
    id: int
    recorded_at: datetime
    class Config:
        from_attributes = True

class PrescriptionBase(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class Prescription(PrescriptionBase):
    id: int
    consultation_id: int
    is_dispensed: bool = False
    class Config:
        from_attributes = True

class ConsultationBase(BaseModel):
    appointment_id: Optional[int] = None
    patient_id: int
    doctor_id: int
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    prescriptions: Optional[List[PrescriptionCreate]] = None

class Consultation(ConsultationBase):
    id: int
    created_at: datetime
    prescriptions: List[Prescription] = []
    class Config:
        from_attributes = True

# --- Billing Schemas ---

class InvoiceItemBase(BaseModel):
    description: str
    quantity: int = 1
    unit_price: float
    amount: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    amount_paid: float
    payment_method: str

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    invoice_id: int
    payment_date: datetime
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    total_amount: float
    status: str = "pending"
    due_date: Optional[datetime] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class Invoice(InvoiceBase):
    id: int
    issued_at: datetime
    items: List[InvoiceItem] = []
    payments: List[Payment] = []
    class Config:
        from_attributes = True

# --- Pharmacy & Lab & HR Schemas ---
# Minimal schemas for the new domains
class InventoryItemBase(BaseModel):
    name: str
    stock_quantity: int = 0
    unit_price: float = 0.0
    expiry_date: Optional[date] = None
    branch_id: int

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItem(InventoryItemBase):
    id: int
    class Config:
        from_attributes = True

class LabTestCatalogBase(BaseModel):
    test_name: str
    description: Optional[str] = None
    price: float

class LabTestCatalogCreate(LabTestCatalogBase):
    pass

class LabTestCatalog(LabTestCatalogBase):
    id: int
    class Config:
        from_attributes = True

class LabOrderBase(BaseModel):
    patient_id: int
    doctor_id: int
    test_id: int

class LabOrderCreate(LabOrderBase):
    pass

class LabOrder(LabOrderBase):
    id: int
    status: str
    ordered_at: datetime
    class Config:
        from_attributes = True

class EmployeeProfileBase(BaseModel):
    user_id: int
    designation: str
    base_salary: float
    hire_date: date

class EmployeeProfileCreate(EmployeeProfileBase):
    pass

class EmployeeProfile(EmployeeProfileBase):
    id: int
    class Config:
        from_attributes = True
