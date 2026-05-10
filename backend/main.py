from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import xgboost as xgb
import shap

app = FastAPI(title="FAILSAFE API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any frontend to connect (good for local testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load the artifacts from Phase 1
print("Loading ML models and tools...")
model = joblib.load('xgboost_model.pkl')
explainer = joblib.load('shap_explainer.pkl')
label_encoders = joblib.load('label_encoders.pkl')
model_columns = joblib.load('model_columns.pkl')

# Define the input data structure
class StudentData(BaseModel):
    data: dict  # We'll accept a dictionary of student features

@app.post("/predict")
async def predict_risk(student: StudentData):
    try:
        # 1. Convert input to DataFrame
        df = pd.DataFrame([student.data])
        
        # 2. Ensure all columns match the training data exactly
        for col in model_columns:
            if col not in df.columns:
                df[col] = 0  # Default missing values
        df = df[model_columns] # Reorder columns to match training exactly

        # 3. Apply Label Encoding to text categories
        for column in df.select_dtypes(include=['object']).columns:
            if column in label_encoders:
                le = label_encoders[column]
                # Handle unseen labels gracefully by assigning a default
                df[column] = df[column].apply(lambda x: x if x in le.classes_ else le.classes_[0])
                df[column] = le.transform(df[column])

        # 4. Make Prediction
        risk_prob = float(model.predict_proba(df)[0][1])
        is_at_risk = bool(risk_prob > 0.5)

        # 5. Generate SHAP Explanations (The "Why")
        shap_values = explainer(df)
        
        # Get the top 3 reasons for this specific prediction
        feature_importance = pd.DataFrame({
            'feature': model_columns,
            'impact': shap_values.values[0]
        }).sort_values(by='impact', key=abs, ascending=False).head(3)

        explanations = []
        for _, row in feature_importance.iterrows():
            direction = "increased" if row['impact'] > 0 else "decreased"
            explanations.append(f"Student's {row['feature']} {direction} their risk score.")

        # 6. Auto-Generate Basic Intervention (Can be expanded later)
        top_factor = feature_importance.iloc[0]['feature']
        if is_at_risk:
            if top_factor == 'absences':
                intervention = "Mandatory meeting with academic counselor regarding attendance."
            elif top_factor == 'failures':
                intervention = "Enroll in supplementary tutoring sessions."
            else:
                intervention = f"Schedule a 1-on-1 to discuss performance related to {top_factor}."
        else:
            intervention = "No immediate action required. Student is on track."

        return {
            "risk_probability": round(risk_prob, 2),
            "is_at_risk": is_at_risk,
            "top_risk_factors": explanations,
            "recommended_intervention": intervention
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "FAILSAFE API is running. Send a POST request to /predict"}