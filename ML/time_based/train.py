import pandas as pd
from pathlib import Path
from difflib import get_close_matches
import joblib

base_dir = Path(__file__).resolve().parent.parent
model_path = base_dir / "time_based"

df = pd.read_csv("purchase.csv")

# strip
df["food_name"] = df["food_name"].str.strip()
df["timeslot"] = df["timeslot"].str.strip()
print("strip completed")

# lower
df["food_name"] = df["food_name"].str.lower()
df["timeslot"] = df["timeslot"].str.lower()
print("lower completed")

# missing
df["food_name"] = df["food_name"].fillna("samosa")
df["timeslot"] = df["timeslot"].fillna("morning")
print("timeslot completed")

# correction
valid_timeslot = [
    "morning",
    "afternoon",
    "noon",
    "evening",
    "night",
    "late night"
]

def correct_timeslot(value):
    if pd.isna(value):
        return "morning"

    match = get_close_matches(
        value,
        valid_timeslot,
        n=1,
        cutoff=0.7
    )

    return match[0] if match else value

df["timeslot"] = df["timeslot"].apply(correct_timeslot)

print("correction completed")

# save cleaned dataset
cleaned_file = model_path / "cleaned_purchase.csv"
df.to_csv(cleaned_file, index=False)

# use cleaned dataset
df = pd.read_csv(cleaned_file)


recommendation_table = (
    df.groupby(["timeslot", "food_name"])
    .size()
    .reset_index(name="PurchaseCount")
)

print("Recommendation Table")
print(recommendation_table)

recommendation_table = recommendation_table.sort_values(
    by=["timeslot", "PurchaseCount"],
    ascending=[True, False]
)

print("Sorted Recommendation Table")
print(recommendation_table)

model_file = model_path / "time_based.pkl"

joblib.dump(
    recommendation_table,
    model_file
)

print("\nRecommendation Model Saved Successfully")
print(f"Saved at: {model_file}")