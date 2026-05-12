import pandas as pd
import xgboost as xgb
import shap
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

print("1. Loading full student dataset...")
# Load the raw data
df = pd.read_csv('../data/student-mat.csv', sep=';') # Sometimes UCI uses ';' as separator

print("2. Prepping 32 features and Target...")
# Create our target: Is the final grade (G3) a failure? (Less than 10)
df['is_at_risk'] = (df['G3'] < 10).astype(int)

# Drop the target from the features
X = df.drop(columns=['G3', 'is_at_risk'])
y = df['is_at_risk']

print("3. Encoding Categories...")
label_encoders = {}
for column in X.select_dtypes(include=['object']).columns:
    le = LabelEncoder()
    X[column] = le.fit_transform(X[column])
    label_encoders[column] = le

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("4. Training the Full-Spectrum XGBoost Model...")
model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    random_state=42,
    use_label_encoder=False,
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

print("✅ SUCCESS! The brain has been upgraded to 32 features.")