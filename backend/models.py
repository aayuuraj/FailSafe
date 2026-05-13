from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="faculty") # Can be 'faculty' or 'hod'
    
    # A user can save multiple student predictions
    students = relationship("StudentProfile", back_populates="owner")

class StudentProfile(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id_string = Column(String, index=True) # E.g., "STU-101"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # The 32 variables saved as JSON
    raw_data = Column(JSON)
    
    # The AI Outputs
    risk_probability = Column(Float)
    is_at_risk = Column(Boolean)
    top_factors = Column(JSON)
    intervention_plan = Column(String)

    # Which faculty member uploaded this?
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="students")