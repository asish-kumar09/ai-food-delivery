import joblib
import pandas as pd
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent

model = joblib.load(base_dir / "delivery_time" / "time.pkl")
festival_encoder = joblib.load(base_dir / "delivery_time" / "festival.pkl")
weekend_encoder = joblib.load(base_dir / "delivery_time" / "weekend.pkl")
month_encoder = joblib.load(base_dir / "delivery_time" / "month.pkl")
traffic_encoder = joblib.load(base_dir / "delivery_time" / "traffic.pkl")
weather_encoder = joblib.load(base_dir / "delivery_time" / "weather.pkl")


def predict_deliverytime(
    distance_km,
    order_items,
    weekend,
    month,
    traffic,
    weather,
    rider_rating,
    festival,
    restaurant_order_queue,
    order_time
):

    festival = festival_encoder.transform([festival])[0]
    weekend = weekend_encoder.transform([weekend])[0]
    month = month_encoder.transform([month])[0]
    traffic = traffic_encoder.transform([traffic])[0]
    weather = weather_encoder.transform([weather])[0]

    
    order_time = pd.to_datetime(order_time, format="%H:%M")

    order_hour = order_time.hour
    order_minute = order_time.minute

    data = pd.DataFrame({
        "distance_km": [distance_km],
        "order_items": [order_items],
        "weekend": [weekend],
        "month": [month],
        "traffic": [traffic],
        "weather": [weather],
        "rider_rating": [rider_rating],
        "festival": [festival],
        "restaurant_order_queue": [restaurant_order_queue],
        "order_hour": [order_hour],
        "order_minute": [order_minute]
    })

    prediction = round(model.predict(data)[0])

    return {
        "delivery_time": prediction
    }