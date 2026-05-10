from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np
import shap

app = FastAPI(title="FAILSAFE API - Full Dataset Version")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your Phase 1 artifacts
print("Loading ML models and encoding artifacts...")
model = joblib.load('xgboost_model.pkl')
explainer = joblib.load('shap_explainer.pkl')
label_encoders = joblib.load('label_encoders.pkl')
model_columns = joblib.load('model_columns.pkl')

class StudentData(BaseModel):
    data: dict 

@app.post("/predict")
async def predict_risk(student: StudentData):
    try:
        # 1. Convert input to DataFrame
        df = pd.DataFrame([student.data])
        
        # 2. Reorder and fill missing columns based on your training artifacts
        # This ensures G2, Dalc, Walc, etc., are included if they were in your model_columns
        for col in model_columns:
            if col not in df.columns:
                df[col] = 0 
        df = df[model_columns]

        # 3. Professional Label Encoding (Handling the "U", "GP", "Teacher" strings)
        for column in df.columns:
            if column in label_encoders:
                le = label_encoders[column]
                # Gracefully handle unseen categories
                df[column] = df[column].apply(lambda x: x if x in le.classes_ else le.classes_[0])
                df[column] = le.transform(df[column])

        # 4. Prediction
        risk_prob = float(model.predict_proba(df)[0][1])
        is_at_risk = bool(risk_prob > 0.5)

        # 5. SHAP Explanations
        shap_values = explainer(df)
        
        feature_importance = pd.DataFrame({
            'feature': model_columns,
            'impact': shap_values.values[0]
        }).sort_values(by='impact', key=abs, ascending=False).head(3)

        explanations = []
        for _, row in feature_importance.iterrows():
            direction = "increased" if row['impact'] > 0 else "decreased"
            explanations.append(f"Student's {row['feature']} {direction} their risk score.")

        # 6. Advanced Intervention Logic
        top_factor = feature_importance.iloc[0]['feature']
        if is_at_risk:
            # Check for the strongest academic predictors first
            if student.data.get('G2', 20) < 10:
                intervention = "Immediate 1-on-1 intensive tutoring required before final exams."
            elif top_factor == 'absences':
                intervention = "Mandatory meeting with academic counselor regarding attendance patterns."
            elif top_factor == 'failures':
                intervention = "Enroll in supplementary foundational support sessions."
            elif top_factor in ['Dalc', 'Walc']:
                intervention = "Counseling requested: Lifestyle factors are significantly impacting focus."
            else:
                intervention = f"Schedule a performance review focusing on {top_factor}."
        else:
            intervention = "No immediate action required. Student is currently on track."

        return {
            "risk_probability": round(risk_prob, 2),
            "is_at_risk": is_at_risk,
            "top_risk_factors": explanations,
            "recommended_intervention": intervention
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "FAILSAFE API is running with full parameters."}