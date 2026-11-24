import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const GATEWAY_URL = "http://localhost:8080";
    const ML_URL = "http://localhost:8000";

    const [foods, setFoods] = useState([]);
    const [recommendedFoods, setRecommendedFoods] = useState({});
    const [timeRecommendedFoods, setTimeRecommendedFoods] = useState({});
    const [search, setSearch] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${GATEWAY_URL}/food/all?page=0&size=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allFoods = response.data.content || [];
            setFoods(allFoods);
            getRecommendations(allFoods);
            getTimeRecommendations(allFoods);
        } catch (error) {
            console.log(error);
        }
    };

    const getRecommendations = async (allFoods) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");
            if (!user || !user.id) return;

            const orderResponse = await axios.get(`${GATEWAY_URL}/order/user/${user.id}?page=0&size=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const orders = orderResponse.data.content || [];
            const purchasedFoods = [];

            for (const order of orders) {
                try {
                    const orderItemResponse = await axios.get(`${GATEWAY_URL}/orderItem/order/${order.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const orderItems = orderItemResponse.data.content || [];

                    for (const item of orderItems) {
                        try {
                            const foodResponse = await axios.get(`${GATEWAY_URL}/food/${item.foodId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            const foodName = foodResponse.data?.foodName;
                            if (foodName && !purchasedFoods.some(name => name.toLowerCase() === foodName.toLowerCase())) {
                                purchasedFoods.push(foodName);
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            console.log("Purchased foods:", purchasedFoods);
            if (purchasedFoods.length === 0) {
                setRecommendedFoods({});
                return;
            }

            const recommendationMap = {};
            for (const foodName of purchasedFoods) {
                try {
                    const response = await axios.post(`${ML_URL}/similar-products`, { food_name: foodName, top_n: 2 });
                    console.log("ML response for", foodName, response.data);
                    if (!Array.isArray(response.data)) continue;

                    for (const recommendation of response.data) {
                        const recommendedName = recommendation?.Food;
                        if (!recommendedName) continue;

                        const recommendedFood = allFoods.find(food => food.foodName?.toLowerCase() === recommendedName.toLowerCase());
                        if (!recommendedFood) continue;

                        if (purchasedFoods.some(name => name.toLowerCase() === recommendedFood.foodName.toLowerCase())) continue;

                        if (!recommendationMap[recommendedFood.id]) {
                            recommendationMap[recommendedFood.id] = { food: recommendedFood, basedOn: foodName };
                        }
                    }
                } catch (error) {
                    console.log("Recommendation failed:", foodName, error);
                }
            }

            console.log("Final recommendations:", recommendationMap);
            setRecommendedFoods(recommendationMap);
        } catch (error) {
            console.log("Recommendation error:", error);
        }
    };

    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                const token = localStorage.getItem("token");
                if (!user?.id || !token) return;

                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`${GATEWAY_URL}/order/user/${user.id}?page=0&size=1000`, { headers });
                const orders = (response.data?.content || []).sort((a, b) => b.id - a.id);
                const currentOrder = orders.find(order => ["PLACED", "ACCEPTED"].includes(order.status?.toUpperCase()));
                if (!currentOrder) return;

                const activeIds = [];
                try {
                    const paymentResponse = await axios.get(`${GATEWAY_URL}/payment/order/${currentOrder.id}`, { headers });
                    if (paymentResponse.data) activeIds.push(`payment-${currentOrder.id}`);
                } catch (error) {
                    console.log("Payment notification check:", error);
                }

                try {
                    const deliveryResponse = await axios.get(`${GATEWAY_URL}/delivery/delivery_order_id/${currentOrder.id}`, { headers });
                    const deliveries = Array.isArray(deliveryResponse.data) ? deliveryResponse.data : deliveryResponse.data?.content || [];
                    const delivery = deliveries.find(item => item.deliveryAgentId > 0 && item.deliveryStatus?.toUpperCase() === "ACCEPTED_BY_AGENT");
                    if (delivery) activeIds.push(`delivery-${currentOrder.id}`);
                } catch (error) {
                    console.log("Delivery notification check:", error);
                }

                const knownIds = JSON.parse(localStorage.getItem("qbKnownNotificationIds") || "[]");
                const readIds = JSON.parse(localStorage.getItem("qbReadNotificationIds") || "[]");
                const updatedKnownIds = [...new Set([...knownIds, ...activeIds])];
                const updatedReadIds = [...new Set(readIds)];

                localStorage.setItem("qbKnownNotificationIds", JSON.stringify(updatedKnownIds));
                const unreadIds = updatedKnownIds.filter(id => !updatedReadIds.includes(id));
                localStorage.setItem("unreadNotificationCount", String(unreadIds.length));
                setUnreadCount(unreadIds.length);
            } catch (error) {
                console.log("Notification count error:", error);
            }
        };

        checkNotifications();
        const timer = setInterval(checkNotifications, 5000);
        return () => clearInterval(timer);
    }, []);

    const getTimeRecommendations = async (allFoods) => {
        try {
            const response = await axios.post(`${ML_URL}/time-recommendations`, {});
            console.log("Time recommendations:", response.data);
            const recommendationMap = {};

            for (const recommendedName of response.data.recommended_foods || []) {
                const recommendedFood = allFoods.find(food => food.foodName?.toLowerCase() === recommendedName.toLowerCase());
                if (recommendedFood) {
                    recommendationMap[recommendedFood.id] = recommendedFood;
                }
            }

            console.log("Matched time recommendations:", recommendationMap);
            setTimeRecommendedFoods(recommendationMap);
        } catch (error) {
            console.log("Time recommendation error:", error);
        }
    };

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${GATEWAY_URL}/food/search/${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFoods(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const openFood = (food) => {
        navigate(`/food/${food.id}`, {
            state: {
                foodItems: location.state?.foodItems || [],
                distanceFee: location.state?.distanceFee || 0,
                restaurantId: location.state?.restaurantId || food.restaurantId
            }
        });
    };

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <h3 className="name">QuickBite</h3>
                <div className="search-box">
                    <input type="text" placeholder="Search food or restaurant..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button onClick={handleSearch}>Search</button>
                </div>
                <ul>
                    <li onClick={() => navigate("/dashboard")}>Home</li>
                    <li onClick={() => navigate("/about")}>Know-Us</li>
                    
                    <li onClick={() => {
                        const knownIds = JSON.parse(localStorage.getItem("qbKnownNotificationIds") || "[]");
                        const readIds = JSON.parse(localStorage.getItem("qbReadNotificationIds") || "[]");
                        localStorage.setItem("qbReadNotificationIds", JSON.stringify([...new Set([...readIds, ...knownIds])]));
                        localStorage.setItem("unreadNotificationCount", "0");
                        setUnreadCount(0);
                        navigate("/notification");
                    }} style={{ position: "relative", cursor: "pointer" }}>
                        <img src="https://www.bing.com/th/id/OIP.quEjDRgVDUSsGriTtOLJvAHaHa?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=ImgAns&rm=2" height="30px" width="30px" alt="notification" />
                        {unreadCount > 0 && (
                            <span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#e32636", color: "#fff", borderRadius: "50%", minWidth: "20px", height: "20px", padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", boxSizing: "border-box" }}>
                                {unreadCount}
                            </span>
                        )}
                    </li>
                    <li onClick={() => navigate("/profile")}>
                        <img src="https://th.bing.com/th/id/OIP.1-zwKjnKoLSmjnuFLQ4MXAHaHa?w=183&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" height="30px" width="30px" alt="profile" />
                    </li>
                </ul>
            </div>

            <h1 className="dashboard-title">Explore Foods</h1>

            <div className="food-grid">
                {foods.map((food) => (
                    <div className="food-card" key={food.id}>
                        <img src={food.imageUrl} alt={food.foodName} className="food-image" />
                        <div className="food-content">
                            <h2>{food.foodName}</h2>
                            <p className="food-category">{food.category}</p>
                            <p className="food-price">₹ {food.price}</p>
                            {recommendedFoods[food.id] && <p className="recommendation-badge">Recommended for you</p>}
                            {timeRecommendedFoods[food.id] && <p className="time-recommendation-badge">Popular at this time</p>}
                            <button className="cart-btn" onClick={() => {
                                const existingFoods = JSON.parse(localStorage.getItem("cartFoods")) || [];
                                const updatedFoods = [...existingFoods, food];
                                localStorage.setItem("cartFoods", JSON.stringify(updatedFoods));
                                navigate("/cart");
                            }}>Add To Cart</button>
                            <button className="cart-btn" onClick={() => openFood(food)}>Food Details</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="footer">
                <p>© 2026 QuickBite</p>
            </div>
        </div>
    );
}

export default Dashboard;