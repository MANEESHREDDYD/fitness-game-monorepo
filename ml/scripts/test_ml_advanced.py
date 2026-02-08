"""
Advanced ML Testing with Multiple Scenarios
Tests different data distributions and model configurations
"""
import os
import pandas as pd
from datetime import datetime, timedelta, timezone
import random
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib

os.makedirs("ml_artifacts", exist_ok=True)

def generate_scenario_data(scenario_name, num_users=100):
    """Generate data for different scenarios"""
    print(f"\n📊 Generating {scenario_name} scenario...")
    
    user_ids = [f"user_{i}" for i in range(1, num_users + 1)]
    events = []
    now = datetime.now(timezone.utc)
    
    event_types = [
        "MATCH_STARTED", "MATCH_FINISHED", "ZONE_CAPTURED",
        "SESSION_STATS_RECORDED", "FRIEND_ADDED"
    ]
    
    if scenario_name == "high_engagement":
        # Most users are active
        active_ratio = 0.8
        active_events_range = (10, 20)
        inactive_events_range = (1, 3)
    elif scenario_name == "high_churn":
        # Most users churn
        active_ratio = 0.3
        active_events_range = (8, 15)
        inactive_events_range = (1, 4)
    elif scenario_name == "balanced":
        # 50-50 split
        active_ratio = 0.5
        active_events_range = (5, 12)
        inactive_events_range = (1, 5)
    else:  # varied_behavior
        # Random distribution
        active_ratio = random.uniform(0.4, 0.6)
        active_events_range = (3, 20)
        inactive_events_range = (1, 8)
    
    for user_id in user_ids:
        is_active = random.random() < active_ratio
        
        if is_active:
            # Past activity
            for _ in range(random.randint(*active_events_range)):
                day_offset = random.randint(0, 6)
                timestamp = now - timedelta(days=day_offset)
                events.append({
                    "id": f"event_{len(events)}",
                    "userId": user_id,
                    "timestamp": timestamp.isoformat(),
                    "eventType": random.choice(event_types),
                    "data": {
                        "matchId": f"match_{random.randint(1, 100)}",
                        "distance": random.uniform(1000, 5000),
                        "calories": random.uniform(200, 600)
                    }
                })
            
            # Future activity (not churned)
            for _ in range(random.randint(2, 8)):
                day_offset = random.randint(1, 7)
                timestamp = now + timedelta(days=day_offset)
                events.append({
                    "id": f"event_{len(events)}",
                    "userId": user_id,
                    "timestamp": timestamp.isoformat(),
                    "eventType": random.choice(event_types),
                    "data": {
                        "matchId": f"match_{random.randint(1, 100)}",
                        "distance": random.uniform(500, 3000),
                        "calories": random.uniform(100, 400)
                    }
                })
        else:
            # Churned users - only past activity
            for _ in range(random.randint(*inactive_events_range)):
                day_offset = random.randint(0, 6)
                timestamp = now - timedelta(days=day_offset)
                events.append({
                    "id": f"event_{len(events)}",
                    "userId": user_id,
                    "timestamp": timestamp.isoformat(),
                    "eventType": random.choice(event_types),
                    "data": {
                        "matchId": f"match_{random.randint(1, 100)}",
                        "distance": random.uniform(0, 1500),
                        "calories": random.uniform(0, 250)
                    }
                })
    
    events_df = pd.DataFrame(events)
    users_df = pd.DataFrame([
        {"id": uid, "email": f"{uid}@example.com", "friends_count": random.randint(0, 30)}
        for uid in user_ids
    ])
    
    print(f"   Generated {len(events)} events for {len(user_ids)} users")
    return events_df, users_df

def build_features(events_df, users_df):
    """Build ML features"""
    WINDOW_DAYS = 7
    events_df["timestamp"] = pd.to_datetime(events_df["timestamp"], utc=True)
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(days=WINDOW_DAYS)
    window_end = now
    
    window_df = events_df[
        (events_df["timestamp"] >= window_start) & 
        (events_df["timestamp"] <= window_end)
    ]
    
    def current_streak(dates, end_date):
        date_set = set(dates)
        streak = 0
        day = end_date.date()
        while day in date_set:
            streak += 1
            day = day - timedelta(days=1)
        return streak
    
    def agg_user(group):
        active_days = group["timestamp"].dt.date.nunique()
        unique_dates = group["timestamp"].dt.date.unique().tolist()
        streak = current_streak(unique_dates, window_end)
        matches = group[group["eventType"].isin(["MATCH_STARTED", "MATCH_FINISHED"])].shape[0]
        distance = group["data"].apply(
            lambda x: x.get("distance", 0) if isinstance(x, dict) else 0
        ).sum()
        calories = group["data"].apply(
            lambda x: x.get("calories", 0) if isinstance(x, dict) else 0
        ).sum()
        friends = group[group["eventType"] == "FRIEND_ADDED"].shape[0]
        return pd.Series({
            "active_days": active_days,
            "matches_played": matches,
            "total_distance": distance,
            "total_calories": calories,
            "current_streak": streak,
            "friends_count": friends
        })
    
    features = window_df.groupby("userId", group_keys=False).apply(agg_user, include_groups=False).reset_index()
    
    # Merge with users
    users_df = users_df.rename(columns={"id": "userId"})
    if "friends_count" in users_df.columns:
        features = features.merge(
            users_df[["userId", "friends_count"]], 
            on="userId", 
            how="left",
            suffixes=("_events", "_users")
        )
        features["friends_count"] = features["friends_count_users"].fillna(
            features["friends_count_events"]
        ).fillna(0)
        features = features.drop(columns=["friends_count_events", "friends_count_users"])
    
    # Label
    label_cutoff = window_end + timedelta(days=WINDOW_DAYS)
    inactive_df = events_df[
        (events_df["timestamp"] > window_end) & 
        (events_df["timestamp"] <= label_cutoff)
    ]
    active_users_next = set(inactive_df["userId"].unique())
    features["churn"] = features["userId"].apply(
        lambda uid: 0 if uid in active_users_next else 1
    )
    
    return features

def test_multiple_models(dataset, scenario_name):
    """Test multiple ML models"""
    print(f"\n🤖 Testing models on {scenario_name}...")
    
    features = dataset.drop(columns=["userId", "churn"])
    labels = dataset["churn"]
    
    if len(dataset) < 10:
        print("   ⚠️  Not enough data")
        return None
    
    if len(set(labels)) < 2:
        print("   ⚠️  Only one class present")
        return None
    
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=50, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=50, random_state=42)
    }
    
    results = {}
    
    for model_name, model in models.items():
        print(f"\n   📈 {model_name}:")
        
        # Train
        model.fit(X_train, y_train)
        
        # Predict
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)[:, 1]
        
        # Metrics
        auc = roc_auc_score(y_test, probs)
        accuracy = (preds == y_test).mean()
        
        print(f"      Accuracy: {accuracy:.3f}")
        print(f"      ROC AUC: {auc:.3f}")
        
        # Confusion matrix
        cm = confusion_matrix(y_test, preds)
        print(f"      Confusion Matrix: {cm.tolist()}")
        
        # Cross-validation
        cv_scores = cross_val_score(model, features, labels, cv=3, scoring='roc_auc')
        print(f"      CV ROC AUC: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
        
        results[model_name] = {
            "accuracy": accuracy,
            "auc": auc,
            "cv_mean": cv_scores.mean(),
            "cv_std": cv_scores.std()
        }
    
    # Save best model
    best_model_name = max(results, key=lambda x: results[x]["auc"])
    best_model = models[best_model_name]
    best_model.fit(features, labels)
    
    filename = f"ml_artifacts/{scenario_name}_model.joblib"
    joblib.dump(best_model, filename)
    print(f"\n   ✅ Best model ({best_model_name}) saved to {filename}")
    
    return results

def main():
    print("🎯 Advanced ML Testing Suite\n")
    print("=" * 60)
    
    scenarios = ["balanced", "high_engagement", "high_churn", "varied_behavior"]
    all_results = {}
    
    for scenario in scenarios:
        print(f"\n{'='*60}")
        print(f"Scenario: {scenario.upper()}")
        print('='*60)
        
        # Generate data
        events_df, users_df = generate_scenario_data(scenario, num_users=150)
        
        # Build features
        dataset = build_features(events_df, users_df)
        
        # Save dataset
        dataset_file = f"ml_artifacts/{scenario}_dataset.csv"
        dataset.to_csv(dataset_file, index=False)
        print(f"   💾 Dataset saved: {dataset_file}")
        
        # Stats
        churn_rate = dataset["churn"].mean()
        print(f"\n   📊 Dataset Stats:")
        print(f"      Total users: {len(dataset)}")
        print(f"      Churn rate: {churn_rate:.2%}")
        print(f"      Avg active days: {dataset['active_days'].mean():.1f}")
        print(f"      Avg matches: {dataset['matches_played'].mean():.1f}")
        print(f"      Avg distance: {dataset['total_distance'].mean():.0f}m")
        
        # Test models
        results = test_multiple_models(dataset, scenario)
        if results:
            all_results[scenario] = results
    
    # Summary
    print(f"\n\n{'='*60}")
    print("📊 SUMMARY - BEST MODELS BY SCENARIO")
    print('='*60)
    
    for scenario, results in all_results.items():
        print(f"\n{scenario.upper()}:")
        for model_name, metrics in results.items():
            print(f"   {model_name}:")
            print(f"      Accuracy: {metrics['accuracy']:.3f}")
            print(f"      ROC AUC: {metrics['auc']:.3f}")
            print(f"      CV ROC AUC: {metrics['cv_mean']:.3f} ± {metrics['cv_std']:.3f}")
    
    print(f"\n{'='*60}")
    print("✅ Advanced ML testing complete!")
    print(f"   Generated {len(scenarios)} scenarios")
    print(f"   Tested 3 models per scenario")
    print(f"   Total artifacts: {len(scenarios) * 2} files")
    print('='*60)

if __name__ == "__main__":
    main()
