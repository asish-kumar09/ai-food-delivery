
import joblib
import pandas as pd
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent

model = joblib.load(base_dir / "dist_fee" / "fee.pkl")
festival_encoder = joblib.load(base_dir / "dist_fee" / "festivals.pkl")
membership_encoder = joblib.load(base_dir / "dist_fee" / "membership.pkl")


def predict_distfee(
    distance_km,
    order_items,
    festival,
    membership
):
    festival = festival_encoder.transform([festival])[0]
    membership = membership_encoder.transform([membership])[0]

    data = pd.DataFrame({
        "distance_km": [distance_km],
        "order_items": [order_items],
        "festival": [festival],
        "membership": [membership]
    })

    prediction = round(model.predict(data)[0])

    return {
        "delivery_fee": prediction
    }