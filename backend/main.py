from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import auth, users, patients, appointments, ehr, billing, pharmacy, laboratory, hr, analytics

import os
from sqlalchemy import create_engine

# Fallback to localhost only for your local computer development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://project_name_251_user:[EMAIL_ADDRESS]:5432/project_name_251")

# For SQLAlchemy 1.4+ / 2.0, Render URLs starting with 'postgres://' 
# need to be fixed to 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

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
