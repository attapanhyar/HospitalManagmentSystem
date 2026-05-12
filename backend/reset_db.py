import models
from database import engine, SessionLocal
from auth import get_password_hash
import datetime

print("Dropping all tables...")
models.Base.metadata.drop_all(bind=engine)

print("Creating all tables...")
models.Base.metadata.create_all(bind=engine)

print("Seeding database...")
db = SessionLocal()

# Seed Main Branch
main_branch = models.Branch(name="Main Hospital Branch", location="Karachi")
db.add(main_branch)
db.commit()
db.refresh(main_branch)

# Seed admin user
admin = models.User(
    email="admin@hospital.com",
    hashed_password=get_password_hash("admin123"),
    role="Admin",
    is_active=True,
    branch_id=main_branch.id
)
db.add(admin)

# Seed doctor
doctor = models.User(
    email="doctor@hospital.com",
    hashed_password=get_password_hash("doctor123"),
    role="Doctor",
    is_active=True,
    branch_id=main_branch.id
)
db.add(doctor)

# Seed receptionist
receptionist = models.User(
    email="receptionist@hospital.com",
    hashed_password=get_password_hash("rec123"),
    role="Receptionist",
    is_active=True,
    branch_id=main_branch.id
)
db.add(receptionist)
db.commit()

# Seed Inventory
med1 = models.InventoryItem(branch_id=main_branch.id, name="Paracetamol 500mg", stock_quantity=1000, unit_price=5.0)
med2 = models.InventoryItem(branch_id=main_branch.id, name="Amoxicillin 250mg", stock_quantity=500, unit_price=12.0)
db.add_all([med1, med2])

# Seed Lab Tests
test1 = models.LabTestCatalog(test_name="Complete Blood Count (CBC)", price=500.0)
test2 = models.LabTestCatalog(test_name="Lipid Profile", price=1200.0)
db.add_all([test1, test2])

# Seed HR Profile for Admin
hr1 = models.EmployeeProfile(user_id=admin.id, designation="Chief Administrator", base_salary=150000.0, hire_date=datetime.date(2023, 1, 1))
db.add(hr1)

db.commit()
print("Database reset and seeded successfully with new massive schema!")
