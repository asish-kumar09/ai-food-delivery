import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/addFood.css";

function AddFood() {
    const navigate = useNavigate();
    const [foodData, setFoodData] = useState({
        name: "",
        price: "",
        imageUrl: "",
        category: "",
        description: "",
        type: "",
        isAvailable: true
    });
    const GATEWAY_URL = "http://localhost:8080";
    const handleChange = (e) => {
        setFoodData({
            ...foodData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user || !user.id) {
                alert("User not found. Please login again.");
                navigate("/login");
                return;
            }

            const restaurantResponse = await axios.get(
                `${GATEWAY_URL}/restaurant/owner/${user.id}`
            );

            const restaurants = restaurantResponse.data.content;

            if (!restaurants || restaurants.length === 0) {
                alert("Restaurant not found for this owner");
                return;
            }

            const restaurant = restaurants[0];
            const token = localStorage.getItem("token");

            await axios.post(
                `${GATEWAY_URL}/food/add`,
                {
                    foodName: foodData.name,
                    description: foodData.description,
                    price: foodData.price,
                    imageUrl: foodData.imageUrl,
                    category: foodData.type,      // "VEG" / "NON_VEG" goes into category
                    isAvailable: foodData.isAvailable,
                    restaurantId: restaurant.id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Food Added Successfully");

            setFoodData({
                name: "",
                price: "",
                imageUrl: "",
                category: "",
                description: "",
                type: "",
                isAvailable: true
            });

        } catch (error) {
            console.log("ADD FOOD ERROR:", error);
            console.log("RESPONSE:", error.response?.data);
            alert("Failed To Add Food");
        }
    };
    return (
        <div className="addfood-container">
            <div className="navbar">
                <h3 className="name">
                    QuickBite</h3>
                <ul>
                    <li onClick={() => navigate("/orderPage")}>
                        Home
                    </li>
                    <li onClick={() => navigate("/addFood")}>
                        Add-New-Item
                    </li>
                    <li
                        onClick={() => navigate("/profile")}>
                        <img
                            src="https://th.bing.com/th/id/OIP.1-zwKjnKoLSmjnuFLQ4MXAHaHa?w=183&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
                            height="30px"
                            width="30px"
                            alt="profile"
                        />
                    </li>
                </ul>
            </div>
            <form
                className="addfood-card"
                onSubmit={handleSubmit}
            >
                <h1>
                    Add Food
                </h1>
                <input
                    type="text"
                    name="name"
                    placeholder="Food Name"
                    value={foodData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={foodData.price}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={foodData.description}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="imageUrl"
                    placeholder="Paste Image URL"
                    value={foodData.imageUrl}
                    onChange={handleChange}
                    required
                />
                <select
                    name="type"
                    value={foodData.type}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Type
                    </option>

                    <option value="VEG">
                        Veg
                    </option>

                    <option value="NON_VEG">
                        Non-Veg
                    </option>

                </select>

                {foodData.imageUrl && (
                    <img
                        src={foodData.imageUrl}
                        alt="food"
                        className="preview-image"
                        onLoad={() => console.log("IMAGE LOADED")}
                        onError={() => console.log("IMAGE FAILED:", foodData.imageUrl)}
                    />
                )}
                <button type="submit">Add Food</button>
            </form>
            <div className="footer">
                <p>
                    © 2026 QuickBite
                </p>
            </div>
        </div>
    );
}
export default AddFood;