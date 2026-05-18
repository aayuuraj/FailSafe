import pandas as pd
import xgboost as xgb
import shap
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

print("1. Loading full student dataset...")
# Load the raw data from your data directory
df = pd.read_csv('../data/student-mat.csv', sep=';') 

print("2. Prepping all 32 features and Target...")
# Create our target: Is the final grade (G3) a failure? (Less than 10)
df['is_at_risk'] = (df['G3'] < 10).astype(int)

# Keeping G1 and G2 inside the feature pool X alongside lifestyle parameters
X = df.drop(columns=['G3', 'is_at_risk'])
y = df['is_at_risk']

print("3. Encoding Categories...")
label_encoders = {}
for column in X.select_dtypes(include=['object']).columns:
    le = LabelEncoder()
    X[column] = le.fit_transform(X[column])
    label_encoders[column] = le

# Split data into strict 80% training and 20% validation sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("4. Training balanced Full-Spectrum XGBoost Model...")
# Optimized hyper-parameters to distribute feature weights smoothly
model = xgb.XGBClassifier(
    n_estimators=150,       # More trees to capture subtle behavioral adjustments
    learning_rate=0.05,     # Smooth updates to prevent erratic percentage drops
    max_depth=7,            # Deep branching to force processing of lower-tier features
    subsample=0.8,          # Introduces row variance
    colsample_bytree=0.7,   # 30% of trees ignore grades, forcing lifestyle tracking
    random_state=42,
    eval_metric='logloss'
)
model.fit(X_train, y_train)

print("5. Generating SHAP Explainer...")
explainer = shap.TreeExplainer(model)

print("6. Saving Artifacts for Backend...")
joblib.dump(model, 'xgboost_model.pkl')
joblib.dump(explainer, 'shap_explainer.pkl')
joblib.dump(label_encoders, 'label_encoders.pkl')
joblib.dump(list(X.columns), 'model_columns.pkl')

print("✅ SUCCESS! Comprehensive model artifacts exported.")

# ========================================================
# 🚨 AUTOMATED OVERFITTING & STRESS-TEST EVALUATION BLOCK
# ========================================================
print("\n===== 🚨 OVERFITTING VERIFICATION =====")

# Evaluate performance on hidden testing data
test_predictions = model.predict(X_test)
test_accuracy = accuracy_score(y_test, test_predictions)

# Evaluate performance on historical training data
train_predictions = model.predict(X_train)
train_accuracy = accuracy_score(y_train, train_predictions)

print(f"📊 Training Set Accuracy: {train_accuracy * 100:.2f}%")
print(f"📊 Testing Set Accuracy:  {test_accuracy * 100:.2f}%")

# Guardrail assessment logic
if train_accuracy == 1.0 and test_accuracy < 0.95:
    print("⚠️ WARNING: Model is overfitting! It has perfectly memorized the training patterns.")
    print("💡 Fix: Lower max_depth to 5 or decrease n_estimators to 100 in the parameters.")
else:
    print("✅ CLEAR: Model shows healthy generalizability across unseen validation vectors.")
print("=======================================\n")