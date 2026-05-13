<div align="center">

# 🚨 FAILSAFE: Enterprise AI Early Intervention Platform

**A proactive, data-driven Machine Learning dashboard for educators to identify at-risk students and generate actionable intervention plans before they fail.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-15C39A?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[Live Vercel Frontend] | [Live Render API Docs]

</div>

---

## 📌 The Problem

In modern educational institutions, student failure often goes undetected until end-of-semester results are finalized. By that time, it is too late for meaningful intervention. Faculty lack a centralized, proactive, data-driven tool to flag at-risk students early and understand the hidden socio-economic and behavioral root causes behind their academic struggles.

## 💡 The Solution

**FAILSAFE** is a full-stack, cloud-deployed Machine Learning platform. By analyzing over 30 behavioral, demographic, and early academic data points, it predicts student outcomes with high accuracy. 

More importantly, FAILSAFE utilizes **Explainable AI (SHAP)**. Instead of acting as a "black box," it translates complex XGBoost decision trees into human-readable "Predictive Drivers," mitigating algorithmic bias and automatically generating personalized intervention protocols for faculty to follow.

---

## 📸 Platform Gallery

### 1. Secure Faculty Authentication
Complete with JWT authentication, encrypted password hashing, and Role-Based Access Control (RBAC).

![Failsafe Login Screen](<img width="770" height="638" alt="image" src="https://github.com/user-attachments/assets/a914fa11-6703-412c-ad84-6e8efe575e27" />
)

### 2. The Predictive Dashboard
A dynamic, React-powered UI featuring interactive risk-probability progress bars and categorized student data inputs.

![Failsafe Dashboard](<img width="1077" height="1061" alt="image" src="https://github.com/user-attachments/assets/03601263-db1a-4993-88da-cae60b6e9eb4" /> <img width="1156" height="607" alt="image" src="https://github.com/user-attachments/assets/1f7572eb-4c36-46d5-887f-0e8f39d2581f" />

)

### 3. Real-Time Intervention Tracking
Expandable history tables with real-time search filtering. Global HOD (Head of Department) overrides vs. standard faculty views.

![History Table](<img width="1065" height="677" alt="image" src="https://github.com/user-attachments/assets/593e8f06-acf0-448d-b7e4-df4139342952" />
)

### 4. Interactive API Documentation
Fully documented REST API with Swagger UI for easy endpoint testing.

![Swagger UI API](./assets/api_docs.png)

---

## 🚀 Enterprise Features

* 🔐 **Zero-Trust Security:** Fully integrated JWT (JSON Web Token) authentication system. Passwords are cryptographically hashed using `bcrypt` before database insertion.
* 👑 **Role-Based Access Control (RBAC):** Hierarchical permissions. Standard 'Faculty' accounts manage only their uploaded student records. 'HOD' (Head of Department) accounts possess global database wipe/override privileges.
* 🧠 **Explainable AI Engine:** Trained on the UCI Student Performance Dataset. Uses SHAP (SHapley Additive exPlanations) to isolate exactly *why* a student was flagged, removing ML bias.
* 📁 **Batch CSV Processing:** Upload entire class rosters via `.csv` for mass inference. Results are securely saved to a relational PostgreSQL database using SQLAlchemy ORM.
* 🔎 **Dynamic UX/UI:** Real-time search filtering, collapsible data tables, and state-managed React components for a seamless, single-page application experience.

---

## 🛠️ System Architecture & Tech Stack

### Frontend (Client)
* **Framework:** React.js (Bootstrapped with Vite for extreme performance)
* **API Communication:** Axios
* **Styling:** Custom CSS-in-JS, fully responsive design
* **Deployment:** Vercel

### Backend (REST API & Database)
* **Framework:** FastAPI (Python) & Uvicorn (ASGI server)
* **Database Management:** SQLAlchemy ORM (SQLite for local, PostgreSQL ready)
* **Authentication:** `passlib`, `python-jose` (JWT), `python-multipart`
* **CORS:** Strictly configured middleware to allow specific Vercel origins
* **Deployment:** Render Web Services

### Machine Learning Pipeline
* **Model:** XGBoost Classifier
* **Explainability:** SHAP TreeExplainer
* **Data Handling:** Pandas, Scikit-learn, Joblib

---

## 🔌 API Endpoint Reference

The backend utilizes FastAPI's auto-generated Swagger documentation. Once running, visit `/docs` to interact with the API.

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Registers a new faculty member with hashed credentials. |
| `POST` | `/token` | Public | Authenticates user and returns a JWT access token. |
| `POST` | `/predict` | **Bearer Token** | Runs ML inference on a single student profile and saves to DB. |
| `POST` | `/upload-csv` | **Bearer Token** | Processes a batch `.csv` file, running inference on all rows. |
| `GET` | `/students` | **Bearer Token** | Retrieves the prediction history specific to the logged-in user. |
| `DELETE` | `/students/clear` | **Bearer Token (HOD)** | Clears database records based on user scope (`personal` or `all`). |

---

## 💻 Local Development Setup

Want to run FAILSAFE on your local machine? Follow these steps:

### Prerequisites
* Python 3.9+
* Node.js & npm
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/failsafe.git](https://github.com/yourusername/failsafe.git)
cd failsafe
### 2. Boot up the FastAPI Backend
Open a terminal in the root directory and navigate to the backend:

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# On Mac/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install the exact dependencies (Prevents CORS/Multipart errors)
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
The API will be live at `http://127.0.0.1:8000`. You can view the API documentation at `http://127.0.0.1:8000/docs`.

### 3. Boot up the React Frontend

Open a *new* terminal tab, navigate to the frontend directory:

```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
The dashboard will be live at `http://localhost:5173`.

> ⚠️ **Note on Local Testing:** Ensure that your frontend `axios.post` URLs in `App.jsx` are pointing to `http://localhost:8000` instead of the live Render URL when testing locally.
