import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../css/fooddetails.css";

function FoodDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [food, setFood] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const GATEWAY_URL = "http://localhost:8080";

    useEffect(() => {
        fetchFood();
    }, []);

    const fetchFood = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${GATEWAY_URL}/food/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFood(response.data);
            const restaurantResponse = await axios.get(
                `${GATEWAY_URL}/restaurant/${response.data.restaurantId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setRestaurant(restaurantResponse.data);
        } catch (error) {
            console.log(error);
        }
    };

    const goToPayment = () => {
        const oldFoodItems = location.state?.foodItems || [];
        const selectedFood = {
            foodId: food.id,
            quantity: quantity
        };

        const updatedFoodItems = [...oldFoodItems, selectedFood];

        navigate("/payment", {
            state: {
                foodItems: updatedFoodItems,
                restaurantId: location.state?.restaurantId || food.restaurantId,
            }
        });
    };

    if (!food) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="fooddetails-container">
            <div className="fooddetails-card">
                <img src={food.imageUrl} alt={food.foodName} />
                <div className="food-content">
                    {restaurant && (
                        <h2>{restaurant.restaurantName}</h2>
                    )}

                    <h1>{food.foodName}</h1>
                    <p>{food.description}</p>
                    <h2>₹ {food.price}</h2>
                    <h3>{food.category}</h3>

                    <div className="quantity-box">
                        <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>
                            -
                        </button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>
                            +
                        </button>
                    </div>

                    <h2>Total : ₹ {food.price * quantity}</h2>

                    <button className="order-btn" onClick={goToPayment}>
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FoodDetails;