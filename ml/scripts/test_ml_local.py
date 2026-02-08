"""
Test ML Pipeline Locally with Mock Data
This script creates sample data to test the ML pipeline without Cosmos DB
"""
import os
import pandas as pd
from datetime import datetime, timedelta, timezone
import random

# Create ml_artifacts directory
os.makedirs("ml_artifacts", exist_ok=True)

def generate_mock_data():
    """Generate mock events and users data for testing"""
    print("🔧 Generating mock data...")
    
    # Generate 50 users
    user_ids = [f"user_{i}" for i in range(1, 51)]
    
    # Generate events for the last 14 days
    events = []
    now = datetime.now(timezone.utc)
    
    event_types = [
        "MATCH_STARTED", "MATCH_FINISHED", "ZONE_CAPTURED", 
        "SESSION_STATS_RECORDED", "FRIEND_ADDED"
    ]
    
    for user_id in user_ids:
        # Active users: 60% with consistent activity (including future activity)
        if random.random() < 0.6:  
            # Past activity (last 7 days)
            days_active = random.randint(5, 7)
            for _ in range(days_active):
                day_offset = random.randint(0, 6)
                timestamp = now - timedelta(days=day_offset)
                
                # Add multiple events per day
                for _ in range(random.randint(2, 6)):
                    events.append({
                        "id": f"event_{len(events)}",
                        "userId": user_id,
                        "timestamp": timestamp.isoformat(),
                        "eventType": random.choice(event_types),
                        "data": {
                            "matchId": f"match_{random.randint(1, 100)}",
                            "distance": random.uniform(0, 5000),
                            "calories": random.uniform(0, 500)
                        }
                    })
            
            # Future activity (next 7 days) - indicates NOT churned
            for _ in range(random.randint(2, 5)):
                day_offset = random.randint(1, 7)
                timestamp = now + timedelta(days=day_offset)
                events.append({
                    "id": f"event_{len(events)}",
                    "userId": user_id,
                    "timestamp": timestamp.isoformat(),
                    "eventType": random.choice(event_types),
                    "data": {
                        "matchId": f"match_{random.randint(1, 100)}",
                        "distance": random.uniform(0, 3000),
                        "calories": random.uniform(0, 400)
                    }
                })
        else:
            # Inactive/churned users: fewer events, NO future activity
            for _ in range(random.randint(1, 4)):
                day_offset = random.randint(0, 6)
                timestamp = now - timedelta(days=day_offset)
                events.append({
                    "id": f"event_{len(events)}",
                    "userId": user_id,
                    "timestamp": timestamp.isoformat(),
                    "eventType": random.choice(event_types),
                    "data": {
                        "matchId": f"match_{random.randint(1, 100)}",
                        "distance": random.uniform(0, 1000),
                        "calories": random.uniform(0, 200)
                    }
                })
    
    # Create users data
    users = []
    for user_id in user_ids:
        users.append({
            "id": user_id,
            "email": f"{user_id}@example.com",
            "friends_count": random.randint(0, 20)
        })
    
    events_df = pd.DataFrame(events)
    users_df = pd.DataFrame(users)
    
    print(f"✅ Generated {len(events)} events for {len(users)} users")
    return events_df, users_df

def build_features_local(events_df, users_df):
    """Build ML features from mock data"""
    print("🔨 Building features...")
    
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
        matches = group[
            group["eventType"].isin(["MATCH_STARTED", "MATCH_FINISHED"])
        ].shape[0]
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
    
    features = window_df.groupby("userId").apply(agg_user).reset_index()
    
    # Merge with users data
    users_df = users_df.rename(columns={"id": "userId"})
    if "friends_count" in features.columns and "friends_count" in users_df.columns:
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
    
    # Label: churned if no activity in next week
    label_cutoff = window_end + timedelta(days=WINDOW_DAYS)
    inactive_df = events_df[
        (events_df["timestamp"] > window_end) & 
        (events_df["timestamp"] <= label_cutoff)
    ]
    active_users_next = set(inactive_df["userId"].unique())
    features["churn"] = features["userId"].apply(
        lambda uid: 0 if uid in active_users_next else 1
    )
    
    print(f"✅ Built features for {len(features)} users")
    print(f"   - Churn rate: {features['churn'].mean():.2%}")
    print(f"   - Avg active days: {features['active_days'].mean():.1f}")
    print(f"   - Avg matches: {features['matches_played'].mean():.1f}")
    
    return features

def test_model_training(dataset):
    """Test model training with the generated dataset"""
    print("\n🤖 Training model...")
    
    from sklearn.model_selection import train_test_split
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import classification_report, roc_auc_score
    import joblib
    
    features = dataset.drop(columns=["userId", "churn"])
    labels = dataset["churn"]
    
    if len(dataset) < 10:
        print("⚠️  Not enough data to train model (need at least 10 samples)")
        return
    
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42
    )
    
    model = LogisticRegression(max_iter=500)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    print("\n📊 Model Performance:")
    print(classification_report(y_test, preds))
    
    if len(set(y_test)) > 1:
        auc = roc_auc_score(y_test, probs)
        print(f"ROC AUC Score: {auc:.3f}")
    
    # Save model
    joblib.dump(model, "ml_artifacts/churn_model.joblib")
    print("\n✅ Model saved to ml_artifacts/churn_model.joblib")
    
    # Test prediction
    print("\n🔮 Sample Predictions:")
    sample = X_test.head(3)
    sample_probs = model.predict_proba(sample)[:, 1]
    for i, prob in enumerate(sample_probs):
        print(f"   User {i+1}: {prob:.2%} churn probability")

def main():
    print("🎯 Testing ML Pipeline Locally\n")
    
    # Generate mock data
    events_df, users_df = generate_mock_data()
    
    # Build features
    dataset = build_features_local(events_df, users_df)
    
    # Save dataset
    dataset.to_csv("ml_artifacts/churn_dataset.csv", index=False)
    print(f"\n💾 Dataset saved to ml_artifacts/churn_dataset.csv")
    
    # Train model
    test_model_training(dataset)
    
    print("\n✅ ML Pipeline test complete!")
    print("\n📋 Next steps:")
    print("   1. Review ml_artifacts/churn_dataset.csv")
    print("   2. Review ml_artifacts/churn_model.joblib")
    print("   3. For Azure ML deployment, configure ml/.env and run:")
    print("      python scripts/deploy_azureml.py")

if __name__ == "__main__":
    main()
