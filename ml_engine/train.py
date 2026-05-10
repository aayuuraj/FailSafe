import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import shap
import joblib

print("Loading data...")
# The UCI dataset uses semicolons as separators
df = pd.read_csv('../data/student-mat.csv', sep=';')

# 1. Define the Target (At-Risk / Failure)
# G3 is the final grade (0-20). Let's say < 10 is failing (1) and >= 10 is passing (0).
df['at_risk'] = (df['G3'] < 10).astype(int)

# 2. Select Features
# We want to predict early, so we drop the final grade (G3) and mid-term grade (G2).
# We keep G1 (first period grade), absences, studytime, failures, and other behavioral/demographic data.
features_to_drop = ['G2', 'G3', 'at_risk']
X = df.drop(columns=features_to_drop)
y = df['at_risk']

# 3. Preprocessing: Convert text categories to numbers
# XGBoost handles numbers better. We'll use Label Encoding for simplicity here.
label_encoders = {}
for column in X.select_dtypes(include=['object']).columns:
    le = LabelEncoder()
    X[column] = le.fit_transform(X[column])
    label_encoders[column] = le

# 4. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training XGBoost model...")
# 5. Train the Model
model = xgb.XGBClassifier(
    n_estimators=100, 
    learning_rate=0.1, 
    max_depth=4, 
    random_state=42,
    use_label_encoder=False,
    eval_metric='logloss'
)
model.fit(X_train, y_train)

# Print basic accuracy
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

print("Generating SHAP Explainer...")
# 6. Initialize SHAP Explainer
# TreeExplainer is heavily optimized for XGBoost
explainer = shap.TreeExplainer(model)

# 7. Save everything for the Backend to use
print("Saving artifacts...")
joblib.dump(model, 'xgboost_model.pkl')
joblib.dump(explainer, 'shap_explainer.pkl')
joblib.dump(label_encoders, 'label_encoders.pkl')
# Save columns to ensure backend input matches exactly
joblib.dump(X_train.columns.tolist(), 'model_columns.pkl') 

print("Phase 1 Complete. Artifacts saved in ml_engine/")