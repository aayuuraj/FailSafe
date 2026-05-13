from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import pandas as pd
import joblib
import io

# Import your database files
import models
import database

# --- 1. SETUP & SECURITY ---
# Create the database tables automatically if they don't exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="FAILSAFE Enterprise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fail-safe-beta.vercel.app", 
        "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Secret Key (In production, put this in an .env file!)
SECRET_KEY = "super-secret-failsafe-key-do-not-share"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- 2. ML MODEL LOADING ---
print("Loading 32-Feature AI Engine...")
model = joblib.load('xgboost_model.pkl')
explainer = joblib.load('shap_explainer.pkl')
label_encoders = joblib.load('label_encoders.pkl')
model_columns = joblib.load('model_columns.pkl')

# --- 3. AUTHENTICATION FUNCTIONS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None: raise credentials_exception
    return user

# --- 4. API ENDPOINTS ---

@app.post("/register")
def register_user(user_data: dict, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_data['email']).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_data['password'])
    new_user = models.User(email=user_data['email'], hashed_password=hashed_pw, full_name=user_data.get('full_name', 'Faculty Member'))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully. You can now log in."}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.full_name}

# Core AI Logic extracted for reuse
# Core AI Logic extracted for reuse
def run_ai_prediction(student_dict):
    df = pd.DataFrame([student_dict])
    for col in model_columns:
        if col not in df.columns: df[col] = 0 
    df = df[model_columns]

    for column in df.columns:
        if column in label_encoders:
            le = label_encoders[column]
            df[column] = df[column].apply(lambda x: x if x in le.classes_ else le.classes_[0])
            df[column] = le.transform(df[column])

    risk_prob = float(model.predict_proba(df)[0][1])
    is_at_risk = bool(risk_prob > 0.5)

    shap_values = explainer(df)
    feature_importance = pd.DataFrame({'feature': model_columns, 'impact': shap_values.values[0]}).sort_values(by='impact', key=abs, ascending=False).head(3)
    
    explanations = [f"Student's {row['feature']} {'increased' if row['impact'] > 0 else 'decreased'} their risk score." for _, row in feature_importance.iterrows()]
    
    top_factor = feature_importance.iloc[0]['feature']
    
    # --- ADVANCED INTERVENTION ENGINE ---
    intervention = "No immediate action required."
    if is_at_risk:
        # 1. Immediate Grade Crisis
        if student_dict.get('G2', 20) < 10: 
            intervention = "Immediate 1-on-1 intensive tutoring required before final exams."
        
        # 2. The Repeat Offender
        elif student_dict.get('failures', 0) > 0:
            intervention = "Assign to senior academic mentor; student has historical pattern of class failure."
        
        # 3. Attendance Issues
        elif top_factor == 'absences': 
            intervention = "Mandatory meeting with academic counselor regarding attendance."
            
        # 4. Bad Study Habits (Low study time, high socializing)
        elif student_dict.get('studytime', 2) == 1 and student_dict.get('goout', 3) >= 4:
            intervention = "Recommend time-management workshop and mandatory supervised study hall."
            
        # 5. Lack of Structural Support at Home
        elif student_dict.get('famsup', 'yes') == 'no':
            intervention = "Enroll student in after-school faculty support program to compensate for lack of home educational resources."
            
        # 6. Dynamic Fallback
        else: 
            intervention = f"Schedule a performance review focusing on {top_factor}."

    return risk_prob, is_at_risk, explanations, intervention

@app.post("/predict")
def predict_single_student(student_data: dict, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    try:
        data = student_data.get("data", student_data) # handle frontend wrapper
        risk_prob, is_at_risk, explanations, intervention = run_ai_prediction(data)

        # Save to Database!
        db_student = models.StudentProfile(
            student_id_string=data.get("student_id", f"STU-{datetime.now().strftime('%H%M%S')}"),
            raw_data=data,
            risk_probability=risk_prob,
            is_at_risk=is_at_risk,
            top_factors=explanations,
            intervention_plan=intervention,
            owner_id=current_user.id
        )
        db.add(db_student)
        db.commit()

        return {"risk_probability": round(risk_prob, 2), "is_at_risk": is_at_risk, "top_risk_factors": explanations, "recommended_intervention": intervention}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-csv")
async def upload_batch_csv(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')), sep=';')
        
        results = []
        for index, row in df.iterrows():
            student_dict = row.to_dict()
            risk_prob, is_at_risk, explanations, intervention = run_ai_prediction(student_dict)
            
            # Save each to DB
            db_student = models.StudentProfile(
                student_id_string=f"BATCH-{index}",
                raw_data=student_dict,
                risk_probability=risk_prob,
                is_at_risk=is_at_risk,
                top_factors=explanations,
                intervention_plan=intervention,
                owner_id=current_user.id
            )
            db.add(db_student)
            results.append({"student": f"Row {index+1}", "risk": is_at_risk, "prob": risk_prob})
            
        db.commit()
        return {"message": f"Successfully processed and saved {len(results)} students.", "summary": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV Processing Error: {str(e)}")
@app.get("/students")
def get_student_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # If the user is an HOD, they see everyone's students. If normal faculty, they only see the ones they uploaded.
    if current_user.role == "hod":
        students = db.query(models.StudentProfile).order_by(models.StudentProfile.created_at.desc()).all()
    else:
        students = db.query(models.StudentProfile).filter(models.StudentProfile.owner_id == current_user.id).order_by(models.StudentProfile.created_at.desc()).all()
    
    return students

@app.delete("/students/clear")
def clear_database(scope: str = "personal", current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # 1. HOD wants to nuke the ENTIRE university database
    if current_user.role == "hod" and scope == "all":
        db.query(models.StudentProfile).delete()
        msg = "Entire university database cleared successfully."
        
    # 2. Faculty (or HOD) wants to clear ONLY their personally uploaded students
    else:
        db.query(models.StudentProfile).filter(models.StudentProfile.owner_id == current_user.id).delete()
        msg = "Your personal student records cleared successfully."
    
    db.commit()
    return {"message": msg}