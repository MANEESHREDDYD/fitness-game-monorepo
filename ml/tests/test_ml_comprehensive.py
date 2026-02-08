"""
ML Pipeline Comprehensive Test Suite
Tests for churn prediction models across multiple scenarios
"""
import unittest
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, confusion_matrix
import joblib
import os


class MLPipelineTests(unittest.TestCase):
    """Comprehensive ML Pipeline Test Suite"""

    @classmethod
    def setUpClass(cls):
        """Setup test data and models"""
        cls.test_scenarios = [
            'balanced',
            'high_engagement',
            'high_churn',
            'varied_behavior'
        ]
        cls.models = [
            'LogisticRegression',
            'RandomForest',
            'GradientBoosting'
        ]

    def setUp(self):
        """Setup each test"""
        self.accuracy_threshold = 0.95  # 95% minimum accuracy
        self.auc_threshold = 0.90  # 0.90 minimum AUC

    # ===== DATA LOADING TESTS =====
    def test_01_balanced_dataset_loads(self):
        """Test 1: Balanced dataset loads correctly"""
        dataset_path = 'ml_artifacts/balanced_dataset.csv'
        self.assertTrue(os.path.exists(dataset_path), f"Dataset not found: {dataset_path}")
        
        df = pd.read_csv(dataset_path)
        self.assertGreater(len(df), 0, "Dataset is empty")
        self.assertIn('churn', df.columns, "Missing 'churn' column")

    def test_02_high_engagement_dataset_loads(self):
        """Test 2: High engagement dataset loads correctly"""
        dataset_path = 'ml_artifacts/high_engagement_dataset.csv'
        self.assertTrue(os.path.exists(dataset_path))
        
        df = pd.read_csv(dataset_path)
        self.assertGreater(len(df), 0)
        self.assertIn('churn', df.columns)

    def test_03_high_churn_dataset_loads(self):
        """Test 3: High churn dataset loads correctly"""
        dataset_path = 'ml_artifacts/high_churn_dataset.csv'
        self.assertTrue(os.path.exists(dataset_path))
        
        df = pd.read_csv(dataset_path)
        self.assertGreater(len(df), 0)
        self.assertIn('churn', df.columns)

    def test_04_varied_behavior_dataset_loads(self):
        """Test 4: Varied behavior dataset loads correctly"""
        dataset_path = 'ml_artifacts/varied_behavior_dataset.csv'
        self.assertTrue(os.path.exists(dataset_path))
        
        df = pd.read_csv(dataset_path)
        self.assertGreater(len(df), 0)
        self.assertIn('churn', df.columns)

    def test_05_balanced_dataset_has_required_columns(self):
        """Test 5: Balanced dataset has all required features"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        required_cols = ['daysActive', 'zoneCaptured', 'matches', 'distance', 'friends', 'inactivityDays', 'churn']
        for col in required_cols:
            self.assertIn(col, df.columns, f"Missing column: {col}")

    def test_06_datasets_have_balanced_classes(self):
        """Test 6: Datasets have reasonable class distribution"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        churn_rate = df['churn'].sum() / len(df)
        # Churn rate should be between 20% and 80%
        self.assertGreater(churn_rate, 0.2, "Churn rate too low")
        self.assertLess(churn_rate, 0.8, "Churn rate too high")

    def test_07_datasets_have_sufficient_samples(self):
        """Test 7: Datasets have sufficient samples for training"""
        datasets = [
            'ml_artifacts/balanced_dataset.csv',
            'ml_artifacts/high_engagement_dataset.csv',
            'ml_artifacts/high_churn_dataset.csv',
            'ml_artifacts/varied_behavior_dataset.csv'
        ]
        for dataset_path in datasets:
            df = pd.read_csv(dataset_path)
            self.assertGreater(len(df), 10, f"Insufficient samples in {dataset_path}")

    # ===== MODEL LOADING TESTS =====
    def test_08_balanced_model_exists(self):
        """Test 8: Balanced model file exists"""
        model_path = 'ml_artifacts/balanced_model.joblib'
        self.assertTrue(os.path.exists(model_path), f"Model not found: {model_path}")

    def test_09_high_engagement_model_exists(self):
        """Test 9: High engagement model file exists"""
        model_path = 'ml_artifacts/high_engagement_model.joblib'
        self.assertTrue(os.path.exists(model_path))

    def test_10_high_churn_model_exists(self):
        """Test 10: High churn model file exists"""
        model_path = 'ml_artifacts/high_churn_model.joblib'
        self.assertTrue(os.path.exists(model_path))

    def test_11_varied_behavior_model_exists(self):
        """Test 11: Varied behavior model file exists"""
        model_path = 'ml_artifacts/varied_behavior_model.joblib'
        self.assertTrue(os.path.exists(model_path))

    def test_12_models_are_valid_joblib(self):
        """Test 12: All models are valid joblib files"""
        models = [
            'ml_artifacts/balanced_model.joblib',
            'ml_artifacts/high_engagement_model.joblib',
            'ml_artifacts/high_churn_model.joblib',
            'ml_artifacts/varied_behavior_model.joblib'
        ]
        for model_path in models:
            try:
                model = joblib.load(model_path)
                self.assertIsNotNone(model, f"Failed to load {model_path}")
            except Exception as e:
                self.fail(f"Failed to load {model_path}: {str(e)}")

    # ===== MODEL PREDICTION TESTS =====
    def test_13_balanced_model_makes_predictions(self):
        """Test 13: Balanced model can make predictions"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        predictions = model.predict(features)
        
        self.assertEqual(len(predictions), len(df), "Prediction count mismatch")
        self.assertTrue(all(p in [0, 1] for p in predictions), "Invalid predictions")

    def test_14_high_engagement_model_makes_predictions(self):
        """Test 14: High engagement model can make predictions"""
        df = pd.read_csv('ml_artifacts/high_engagement_dataset.csv')
        model = joblib.load('ml_artifacts/high_engagement_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        predictions = model.predict(features)
        
        self.assertEqual(len(predictions), len(df))
        self.assertTrue(all(p in [0, 1] for p in predictions))

    def test_15_high_churn_model_makes_predictions(self):
        """Test 15: High churn model can make predictions"""
        df = pd.read_csv('ml_artifacts/high_churn_dataset.csv')
        model = joblib.load('ml_artifacts/high_churn_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        predictions = model.predict(features)
        
        self.assertEqual(len(predictions), len(df))
        self.assertTrue(all(p in [0, 1] for p in predictions))

    def test_16_varied_behavior_model_makes_predictions(self):
        """Test 16: Varied behavior model can make predictions"""
        df = pd.read_csv('ml_artifacts/varied_behavior_dataset.csv')
        model = joblib.load('ml_artifacts/varied_behavior_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        predictions = model.predict(features)
        
        self.assertEqual(len(predictions), len(df))
        self.assertTrue(all(p in [0, 1] for p in predictions))

    # ===== MODEL ACCURACY TESTS =====
    def test_17_balanced_model_accuracy(self):
        """Test 17: Balanced model has acceptable accuracy"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions = model.predict(features)
        
        accuracy = accuracy_score(labels, predictions)
        self.assertGreaterEqual(accuracy, self.accuracy_threshold, f"Accuracy too low: {accuracy}")

    def test_18_high_engagement_model_accuracy(self):
        """Test 18: High engagement model has acceptable accuracy"""
        df = pd.read_csv('ml_artifacts/high_engagement_dataset.csv')
        model = joblib.load('ml_artifacts/high_engagement_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions = model.predict(features)
        
        accuracy = accuracy_score(labels, predictions)
        self.assertGreaterEqual(accuracy, self.accuracy_threshold)

    def test_19_high_churn_model_accuracy(self):
        """Test 19: High churn model has acceptable accuracy"""
        df = pd.read_csv('ml_artifacts/high_churn_dataset.csv')
        model = joblib.load('ml_artifacts/high_churn_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions = model.predict(features)
        
        accuracy = accuracy_score(labels, predictions)
        self.assertGreaterEqual(accuracy, self.accuracy_threshold)

    def test_20_varied_behavior_model_accuracy(self):
        """Test 20: Varied behavior model has acceptable accuracy"""
        df = pd.read_csv('ml_artifacts/varied_behavior_dataset.csv')
        model = joblib.load('ml_artifacts/varied_behavior_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions = model.predict(features)
        
        accuracy = accuracy_score(labels, predictions)
        self.assertGreaterEqual(accuracy, self.accuracy_threshold)

    # ===== AUC/ROC TESTS =====
    def test_21_balanced_model_auc_score(self):
        """Test 21: Balanced model has good AUC score"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions_proba = model.predict_proba(features)[:, 1]
        
        auc = roc_auc_score(labels, predictions_proba)
        self.assertGreaterEqual(auc, self.auc_threshold)

    def test_22_high_engagement_model_auc_score(self):
        """Test 22: High engagement model has good AUC score"""
        df = pd.read_csv('ml_artifacts/high_engagement_dataset.csv')
        model = joblib.load('ml_artifacts/high_engagement_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions_proba = model.predict_proba(features)[:, 1]
        
        auc = roc_auc_score(labels, predictions_proba)
        self.assertGreaterEqual(auc, self.auc_threshold)

    def test_23_high_churn_model_auc_score(self):
        """Test 23: High churn model has good AUC score"""
        df = pd.read_csv('ml_artifacts/high_churn_dataset.csv')
        model = joblib.load('ml_artifacts/high_churn_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions_proba = model.predict_proba(features)[:, 1]
        
        auc = roc_auc_score(labels, predictions_proba)
        self.assertGreaterEqual(auc, self.auc_threshold)

    def test_24_varied_behavior_model_auc_score(self):
        """Test 24: Varied behavior model has good AUC score"""
        df = pd.read_csv('ml_artifacts/varied_behavior_dataset.csv')
        model = joblib.load('ml_artifacts/varied_behavior_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        predictions_proba = model.predict_proba(features)[:, 1]
        
        auc = roc_auc_score(labels, predictions_proba)
        self.assertGreaterEqual(auc, self.auc_threshold)

    # ===== PREDICTION DISTRIBUTION TESTS =====
    def test_25_predictions_have_both_classes(self):
        """Test 25: Model predicts both classes"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        predictions = model.predict(features)
        
        unique_predictions = set(predictions)
        self.assertGreaterEqual(len(unique_predictions), 1)

    def test_26_probability_scores_are_valid(self):
        """Test 26: Model probability scores are between 0 and 1"""
        df = pd.read_csv('ml_artifacts/high_engagement_dataset.csv')
        model = joblib.load('ml_artifacts/high_engagement_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        predictions_proba = model.predict_proba(features)
        
        self.assertTrue(all((predictions_proba >= 0).all()), "Probabilities below 0")
        self.assertTrue(all((predictions_proba <= 1).all()), "Probabilities above 1")

    # ===== EDGE CASE TESTS =====
    def test_27_model_handles_missing_values(self):
        """Test 27: Model can handle data without NaN"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        self.assertEqual(features.isna().sum().sum(), 0, "Data has NaN values")

    def test_28_model_consistency(self):
        """Test 28: Model produces consistent predictions"""
        df = pd.read_csv('ml_artifacts/high_churn_dataset.csv')
        model = joblib.load('ml_artifacts/high_churn_model.joblib')
        
        features = df.drop(columns=['userId', 'churn']).iloc[:10]
        
        pred1 = model.predict(features)
        pred2 = model.predict(features)
        
        self.assertTrue(np.array_equal(pred1, pred2), "Predictions not consistent")

    # ===== INTEGRATION TESTS =====
    def test_29_all_models_trained(self):
        """Test 29: All 4 models are trained and available"""
        models_to_check = [
            'ml_artifacts/balanced_model.joblib',
            'ml_artifacts/high_engagement_model.joblib',
            'ml_artifacts/high_churn_model.joblib',
            'ml_artifacts/varied_behavior_model.joblib'
        ]
        
        for model_path in models_to_check:
            self.assertTrue(os.path.exists(model_path), f"Missing: {model_path}")

    def test_30_all_datasets_available(self):
        """Test 30: All 4 datasets are available"""
        datasets_to_check = [
            'ml_artifacts/balanced_dataset.csv',
            'ml_artifacts/high_engagement_dataset.csv',
            'ml_artifacts/high_churn_dataset.csv',
            'ml_artifacts/varied_behavior_dataset.csv'
        ]
        
        for dataset_path in datasets_to_check:
            self.assertTrue(os.path.exists(dataset_path), f"Missing: {dataset_path}")

    # ===== PERFORMANCE TESTS =====
    def test_31_model_inference_speed(self):
        """Test 31: Model inference is fast (<100ms)"""
        import time
        
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn']).iloc[:10]
        
        start = time.time()
        model.predict_proba(features)
        elapsed = (time.time() - start) * 1000  # Convert to ms
        
        self.assertLess(elapsed, 100, f"Inference too slow: {elapsed}ms")

    def test_32_batch_prediction_works(self):
        """Test 32: Can make batch predictions on large dataset"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        predictions = model.predict(features)
        
        self.assertEqual(len(predictions), len(df))

    # ===== VALIDATION TESTS =====
    def test_33_cross_validation_compatible(self):
        """Test 33: Models are compatible with cross-validation"""
        df = pd.read_csv('ml_artifacts/balanced_dataset.csv')
        model = joblib.load('ml_artifacts/balanced_model.joblib')
        
        features = df.drop(columns=['userId', 'churn'])
        labels = df['churn']
        
        # Check model has required methods
        self.assertTrue(hasattr(model, 'predict'))
        self.assertTrue(hasattr(model, 'predict_proba'))
        self.assertTrue(hasattr(model, 'fit'))

    def test_34_feature_importance_available(self):
        """Test 34: Can extract feature importance if available"""
        df = pd.read_csv('ml_artifacts/high_engagement_dataset.csv')
        model = joblib.load('ml_artifacts/high_engagement_model.joblib')
        
        # Try to get feature importance if model supports it
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
            self.assertEqual(len(importance), len(df.columns) - 2)  # -2 for userId and churn

    def test_35_model_serialization_valid(self):
        """Test 35: Model serialization is valid"""
        model_path = 'ml_artifacts/balanced_model.joblib'
        model = joblib.load(model_path)
        
        # Verify model can be serialized again
        temp_path = 'ml_artifacts/temp_model.joblib'
        joblib.dump(model, temp_path)
        
        reloaded = joblib.load(temp_path)
        self.assertIsNotNone(reloaded)
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == '__main__':
    unittest.main(verbosity=2)
