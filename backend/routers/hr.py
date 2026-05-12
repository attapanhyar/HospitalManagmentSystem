from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/hr", tags=["HR & Payroll"])

# --- Profiles ---
@router.post("/profiles/", response_model=schemas.EmployeeProfile)
def create_profile(profile: schemas.EmployeeProfileCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_profile = models.EmployeeProfile(**profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/profiles/", response_model=List[schemas.EmployeeProfile])
def read_profiles(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.EmployeeProfile)
    if current_user.branch_id:
        query = query.join(models.User).filter(models.User.branch_id == current_user.branch_id)
    return query.offset(skip).limit(limit).all()

@router.get("/profiles/{user_id}", response_model=schemas.EmployeeProfile)
def read_profile(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.EmployeeProfile).filter(models.EmployeeProfile.user_id == user_id)
    if current_user.branch_id:
        query = query.join(models.User).filter(models.User.branch_id == current_user.branch_id)
    profile = query.first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
