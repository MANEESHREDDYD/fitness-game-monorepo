import json
import joblib
import numpy as np

model = None


def init():
    global model
    model = joblib.load("churn_model.joblib")


def run(raw_data):
    data = json.loads(raw_data)
    features = np.array(data["features"]).reshape(1, -1)
    probability = model.predict_proba(features)[0][1]
    return json.dumps({"churn_probability": float(probability)})
