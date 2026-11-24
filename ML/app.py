from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from delivery_time.predict import predict_deliverytime
from dist_fee.predict import predict_distfee
from similar_product.predict import recommend_products as recommend_similar_products
from time_based.predict import recommend_products as recommend_time_products
from combo.predict import recommend_combo   
import os

app = FastAPI(
    title="ML Prediction API",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        *[
            origin.strip()
            for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
            if origin.strip()
        ],
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class DeliveryRequest(BaseModel):
    distance_km: float
    order_items: float
    weekend: str
    month: str
    traffic: str
    weather: str
    rider_rating: float
    festival: str
    restaurant_order_queue: float
    order_time: str


class DistFee(BaseModel):
    distance_km: float
    order_items: float
    festival: str
    membership: str


class SimilarProductRequest(BaseModel):
    food_name: str
    top_n: int = 5


class TimeRecommendationRequest(BaseModel):
    time: str | None = None

class Combo_offers(BaseModel):
    food_item:str

@app.get("/")
def home():
    return {
        "message": "ML Prediction API is Running"
    }


@app.post("/time")
def time(request: DeliveryRequest):

    result = predict_deliverytime(
        distance_km=request.distance_km,
        order_items=request.order_items,
        weekend=request.weekend,
        month=request.month,
        traffic=request.traffic,
        weather=request.weather,
        rider_rating=request.rider_rating,
        festival=request.festival,
        restaurant_order_queue=request.restaurant_order_queue,
        order_time=request.order_time
    )

    return result


@app.post("/fee")
def fee(request: DistFee):

    result = predict_distfee(
        distance_km=request.distance_km,
        order_items=request.order_items,
        festival=request.festival,
        membership=request.membership
    )

    return result


@app.post("/similar-products")
def similar_products(request: SimilarProductRequest):

    result = recommend_similar_products(
        food_name=request.food_name,
        top_n=request.top_n
    )

    return result

@app.post("/combo")
def combo_products(request: Combo_offers):

    result = recommend_combo(
        product_name=request.food_item
    )
    return result


@app.post("/time-recommendations")
def time_recommendations(request: TimeRecommendationRequest):

    result = recommend_time_products(
        time=request.time
    )

    return {
        "time": request.time,
        "recommended_foods": result
    }