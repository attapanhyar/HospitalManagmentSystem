from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from auth import get_password_hash
from database import SessionLocal, engine
from routers import auth, users, patients, appointments, ehr, billing, pharmacy, laboratory, hr, analytics

models.Base.metadata.create_all(bind=engine)

def seed_default_data():
    db = SessionLocal()
    try:
        main_branch = db.query(models.Branch).filter(models.Branch.name == "Main Hospital Branch").first()
        if not main_branch:
            main_branch = models.Branch(name="Main Hospital Branch", location="Karachi")
            db.add(main_branch)
            db.commit()
            db.refresh(main_branch)

        default_users = [
            ("admin@hospital.com", "admin123", "Admin"),
            ("doctor@hospital.com", "doctor123", "Doctor"),
            ("receptionist@hospital.com", "rec123", "Receptionist"),
        ]
        for email, password, role in default_users:
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                db.add(models.User(
                    email=email,
                    hashed_password=get_password_hash(password),
                    role=role,
                    is_active=True,
                    branch_id=main_branch.id,
                ))

        if not db.query(models.InventoryItem).first():
            db.add_all([
                models.InventoryItem(branch_id=main_branch.id, name="Paracetamol 500mg", stock_quantity=1000, unit_price=5.0),
                models.InventoryItem(branch_id=main_branch.id, name="Amoxicillin 250mg", stock_quantity=500, unit_price=12.0),
            ])

        if not db.query(models.LabTestCatalog).first():
            db.add_all([
                models.LabTestCatalog(test_name="Complete Blood Count (CBC)", price=500.0),
                models.LabTestCatalog(test_name="Lipid Profile", price=1200.0),
            ])

        db.commit()
    finally:
        db.close()

seed_default_data()

app = FastAPI(title="Hospital ERP API Pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(ehr.router)
app.include_router(billing.router)
app.include_router(pharmacy.router)
app.include_router(laboratory.router)
app.include_router(hr.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "Welcome to Hospital ERP API Pro"}
