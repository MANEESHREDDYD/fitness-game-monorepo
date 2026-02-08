import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

DATASET_PATH = "ml_artifacts/churn_dataset.csv"


def main():
    if not os.path.exists(DATASET_PATH):
        raise RuntimeError("Dataset not found. Run build_dataset.py first.")

    df = pd.read_csv(DATASET_PATH)
    features = df.drop(columns=["userId", "churn"])
    labels = df["churn"]

    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
    model = LogisticRegression(max_iter=500)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    print(classification_report(y_test, preds))

    os.makedirs("ml_artifacts", exist_ok=True)
    joblib.dump(model, "ml_artifacts/churn_model.joblib")
    print("Saved model to ml_artifacts/churn_model.joblib")


if __name__ == "__main__":
    main()
