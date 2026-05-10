# 🚨 FAILSAFE: AI-Driven Early Intervention System

(img width="1260" height="901" alt="image" src="https://github.com/user-attachments/assets/e0267a0c-5f83-4487-8409-cef651c75b43" />
)


## 📌 The Problem
In educational institutions, student failure often goes undetected until end-of-semester results are finalized, leaving no room for meaningful intervention. Faculty lack a proactive, data-driven tool to identify at-risk students early and understand the root causes behind their academic struggles.

## 💡 The Solution
**FAILSAFE** is a full-stack machine learning application that predicts student failure risk *before* it happens. By analyzing behavioral, demographic, and early academic data, it flags at-risk students and uses **Explainable AI (SHAP)** to tell educators exactly *why* a student is struggling, generating actionable intervention plans.

## 🛠️ Tech Stack
* **Machine Learning Engine:** Python, XGBoost, scikit-learn, SHAP, Pandas
* **Backend API:** FastAPI, Uvicorn, Pydantic
* **Frontend Dashboard:** React.js, Vite, Axios
* **UI/UX:** Custom CSS-in-JS, Responsive Design

## 🚀 Features
* **Early Risk Prediction:** Trained on the UCI Student Performance Dataset to predict outcomes based on 30+ parameters.
* **Diagnostic Factor Analysis:** Translates complex XGBoost decision trees into human-readable "Predictive Drivers," mitigating algorithmic bias.
* **Auto-Generated Interventions:** Maps specific risk factors to actionable advice.
* **Robust Form Validation:** Custom React UI with strict data boundaries ensuring clean ML pipeline inputs.

## 💻 How to Run Locally

### 1. The FastAPI Backend
Open a terminal in the project root and run:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pandas xgboost shap joblib scikit-learn pydantic
uvicorn main:app --reload
```
*API will run on http://127.0.0.1:8000*

### 2. The React Frontend
Open a new terminal tab in the project root and run:
```bash
cd frontend
npm install
npm run dev
```
*Dashboard will run on http://localhost:5173*
