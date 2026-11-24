import pandas as pd
from pathlib import Path
from datetime import datetime
import joblib

base_dir = Path(__file__).resolve().parent.parent
model_path = base_dir / "time_based" / "time_based.pkl"

model = joblib.load(model_path)

def get_current_time_slot():
    current_hour = datetime.now().hour

    if 5 <= current_hour < 12:
        return "morning"
    elif 12 <= current_hour < 14:
        return "afternoon"
    elif 14 <= current_hour < 17:
        return "noon"
    elif 17 <= current_hour < 19:
        return "evening"
    elif 19 <= current_hour < 23:
        return "night"
    else:
        return "late night"

def get_time_slot(time):
    hour = datetime.strptime(time, "%H:%M").hour

    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 14:
        return "afternoon"
    elif 14 <= hour < 17:
        return "noon"
    elif 17 <= hour < 19:
        return "evening"
    elif 19 <= hour < 23:
        return "night"
    else:
        return "late night"

def recommend_products(time=None):
    if time is None:
        time_slot = get_current_time_slot()
    else:
        time_slot = get_time_slot(time)

    recommendations = model[
        model["timeslot"] == time_slot
    ]

    recommendations = recommendations.sort_values(
        by="PurchaseCount",
        ascending=False
    ).head(5)

    return recommendations["food_name"].tolist()

if __name__ == "__main__":
    print("Current time recommendations:")
    print(recommend_products())

    print("20:25 recommendations:")
    print(recommend_products("20:25"))