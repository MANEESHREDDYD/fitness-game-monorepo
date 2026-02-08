import os
from datetime import datetime, timedelta, timezone
from azure.cosmos import CosmosClient
import pandas as pd

COSMOS_CONNECTION = os.getenv("COSMOS_CONNECTION", "")
COSMOS_DB_NAME = os.getenv("COSMOS_DB_NAME", "fitnessGame")

WINDOW_DAYS = 7


def load_events():
    if not COSMOS_CONNECTION:
        raise RuntimeError("COSMOS_CONNECTION is not set")
    client = CosmosClient.from_connection_string(COSMOS_CONNECTION)
    db = client.get_database_client(COSMOS_DB_NAME)
    container = db.get_container_client("Events")
    items = list(container.read_all_items())
    return pd.DataFrame(items)


def load_users():
    if not COSMOS_CONNECTION:
        raise RuntimeError("COSMOS_CONNECTION is not set")
    client = CosmosClient.from_connection_string(COSMOS_CONNECTION)
    db = client.get_database_client(COSMOS_DB_NAME)
    container = db.get_container_client("Users")
    items = list(container.read_all_items())
    return pd.DataFrame(items)


def build_features(events_df: pd.DataFrame, users_df: pd.DataFrame):
    if events_df.empty:
        return pd.DataFrame()

    events_df["timestamp"] = pd.to_datetime(events_df["timestamp"], utc=True)
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(days=WINDOW_DAYS)
    window_end = now

    window_df = events_df[(events_df["timestamp"] >= window_start) & (events_df["timestamp"] <= window_end)]

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
        distance = group["data"].apply(lambda x: x.get("distance", 0) if isinstance(x, dict) else 0).sum()
        calories = group["data"].apply(lambda x: x.get("calories", 0) if isinstance(x, dict) else 0).sum()
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

    if not users_df.empty:
        users_df = users_df.rename(columns={"id": "userId"})
        if "friendsCount" in users_df.columns:
            users_df = users_df.rename(columns={"friendsCount": "friends_count"})
        if "friends_count" in users_df.columns:
            features = features.merge(users_df[["userId", "friends_count"]], on="userId", how="left")
            features["friends_count"] = features["friends_count_y"].fillna(features["friends_count_x"]).fillna(0)
            features = features.drop(columns=["friends_count_x", "friends_count_y"])

    label_cutoff = window_end + timedelta(days=WINDOW_DAYS)
    inactive_df = events_df[(events_df["timestamp"] > window_end) & (events_df["timestamp"] <= label_cutoff)]
    active_users_next = set(inactive_df["userId"].unique())
    features["churn"] = features["userId"].apply(lambda uid: 0 if uid in active_users_next else 1)

    return features


def main():
    events = load_events()
    users = load_users()
    dataset = build_features(events, users)
    dataset.to_csv("ml_artifacts/churn_dataset.csv", index=False)
    print("Saved dataset to ml_artifacts/churn_dataset.csv")


if __name__ == "__main__":
    os.makedirs("ml_artifacts", exist_ok=True)
    main()
