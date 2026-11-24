import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/orderalert.css";

function OrderAlert() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [details, setDetails] = useState({});
    const [predictedTimes, setPredictedTimes] = useState({});
    const [deliveryDeadlines, setDeliveryDeadlines] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());
    const Url = "http://localhost:8080";
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchAvailableOrders();
        fetchMyOrders();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getOrderDetails = async (delivery) => {
        try {
            const orderResponse = await axios.get(`${Url}/order/${delivery.orderId}`, { headers });
            const order = orderResponse.data;

            const customerResponse = await axios.get(`${Url}/user/${order.userId}`, { headers });
            const customer = customerResponse.data;

            console.log("Customer Response:", customer);
            console.log("Customer ID:", customer.id);
            console.log("Customer Latitude:", customer.latitude);
            console.log("Customer Longitude:", customer.longitude);

            const restaurantResponse = await axios.get(`${Url}/restaurant/${order.restaurantId}`, { headers });
            const restaurant = restaurantResponse.data;

            console.log("restaurant Response:", restaurant);
            console.log("restaurant ID:", restaurant.id);
            console.log("restaurant Latitude:", restaurant.latitude);
            console.log("restaurant Longitude:", restaurant.longitude);

            const ownerResponse = await axios.get(`${Url}/user/${restaurant.ownerId}`, { headers });
            const owner = ownerResponse.data;

            const itemResponse = await axios.get(`${Url}/orderItem/order/${delivery.orderId}`, { headers });
            const items = itemResponse.data.content || [];
            const paymentResponse = await axios.get(`${Url}/payment/order/${delivery.orderId}`, { headers }).catch(() => ({ data: null }));
            const foodItems = [];

            for (const item of items) {
                const foodResponse = await axios.get(`${Url}/food/${item.foodId}`, { headers });
                foodItems.push({ ...item, food: foodResponse.data });
            }

            const data = {
                order,
                customer,
                owner,
                restaurant,
                foodItems,
                 payment: paymentResponse.data
            };

            setDetails(prev => ({
                ...prev,
                [delivery.id]: data
            }));

            return data;
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
            return null;
        }
    };

    const getRestaurantQueue = async (restaurantId, currentOrderId) => {
        try {
            const response = await axios.get(
                `${Url}/order/restaurant/${restaurantId}`,
                { headers }
            );

            const restaurantOrders = response.data.content || response.data || [];

            const activeStatuses = [
                "PLACED",
                "ACCEPTED",
                "OUT_FOR_DELIVERY"
            ];

            return restaurantOrders.filter(order =>
                order.id !== currentOrderId &&
                activeStatuses.includes(order.status)
            ).length;
        } catch (error) {
            console.log("Restaurant queue error:", error);
            console.log(error.response?.data);
            return 0;
        }
    };

    const predictDeliveryTime = async (delivery, data) => {
        try {
            const distanceResponse = await axios.get(
                `${Url}/user/distance/${data.order.userId}/${data.restaurant.ownerId}`,
                { headers }
            );

            console.log("Customer ID:", data.order.userId);
            console.log("Owner ID:", data.restaurant.ownerId);
            console.log("Distance Response:", distanceResponse.data);

            const distanceKm = Number(distanceResponse.data);

            console.log("Distance KM:", distanceKm);

            const orderItemsCount = data.foodItems.reduce(
                (total, item) => total + Number(item.quantity),
                0
            );

            const now = new Date();

            const weekend =
                now.getDay() === 0 || now.getDay() === 6
                    ? "weekend"
                    : "non_weekend";

            const months = [
                "january",
                "february",
                "march",
                "april",
                "may",
                "june",
                "july",
                "august",
                "september",
                "october",
                "november",
                "december"
            ];

            const month = months[now.getMonth()];

            const hour = now.getHours();
            const minute = now.getMinutes();

            const orderTime =
                `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            let traffic = "normal";

            if (hour >= 7 && hour < 9) {
                traffic = "medium";
            } else if (hour >= 9 && hour < 11) {
                traffic = "high";
            } else if (hour >= 11 && hour < 14) {
                traffic = "veryhigh";
            } else if (hour >= 14 && hour < 16) {
                traffic = "medium";
            } else if (hour >= 16 && hour < 18) {
                traffic = "high";
            } else if (hour >= 18 && hour < 22) {
                traffic = "veryhigh";
            } else if (hour >= 22 && hour < 23) {
                traffic = "normal";
            }

            let weather = "normal";

            if (
                month === "december" ||
                month === "january" ||
                month === "february"
            ) {
                weather = "fog";
            } else if (
                month === "march" ||
                month === "april" ||
                month === "may"
            ) {
                weather = "normal";
            } else if (
                month === "june" ||
                month === "july" ||
                month === "august" ||
                month === "september"
            ) {
                weather = "rain";
            } else if (
                month === "october" ||
                month === "november"
            ) {
                weather = "cloudy";
            }

            const riderRating = 4.5;
            const festival = "normal";

            const restaurantOrderQueue = await getRestaurantQueue(
                data.order.restaurantId,
                data.order.id
            );

            const request = {
                distance_km: distanceKm,
                order_items: orderItemsCount,
                weekend: weekend,
                month: month,
                traffic: traffic,
                weather: weather,
                rider_rating: riderRating,
                festival: festival,
                restaurant_order_queue: restaurantOrderQueue,
                order_time: orderTime
            };

            console.log("Delivery Time Request:", request);

            const response = await axios.post(
                "http://localhost:8000/time",
                request
            );

            const predictedTime = Math.round(Number(response.data.delivery_time));

            const orderedTime = data.order.createdAt
                ? new Date(data.order.createdAt)
                : now;

            const deliveryDeadline = new Date(
                orderedTime.getTime() + predictedTime * 60 * 1000
            );
            localStorage.setItem(
                `deliveryDeadline_${data.order.id}`,
                deliveryDeadline.toISOString()
            );

            localStorage.setItem(
                `predictedTime_${data.order.id}`,
                predictedTime
            );

            setPredictedTimes(prev => ({
                ...prev,
                [delivery.id]: predictedTime
            }));

            setDeliveryDeadlines(prev => ({
                ...prev,
                [delivery.id]: deliveryDeadline
            }));
        } catch (error) {
            console.log("Delivery time prediction error:", error);
            console.log(error.response?.data);
        }
    };

    const isDeliveryTimeReached = (deliveryId) => {
        const deadline = deliveryDeadlines[deliveryId];
        return deadline ? currentTime >= deadline : false;
    };

    const getExpectedDeliveryTime = (deliveryId) => {
        const deadline = deliveryDeadlines[deliveryId];

        return deadline
            ? new Date(deadline).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
            : "";
    };

    const fetchAvailableOrders = async () => {
        try {
            const response = await axios.get(`${Url}/delivery/pending`, { headers });
            const deliveries = response.data;
            setOrders(deliveries);

            for (const delivery of deliveries) {
                await getOrderDetails(delivery);
            }
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            const response = await axios.get(
                `${Url}/delivery/delivery_agent_id/${user.id}`,
                { headers }
            );

            const deliveries = response.data.content || [];
            setMyOrders(deliveries);

            for (const delivery of deliveries) {
                const data = await getOrderDetails(delivery);

                if (
                    data &&
                    delivery.deliveryStatus !== "DELIVERED"
                ) {
                    await predictDeliveryTime(delivery, data);
                }
            }
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
        }
    };

    const acceptOrder = async (deliveryId) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            await axios.put(
                `${Url}/delivery/accept/${deliveryId}/${user.id}`,
                {},
                { headers }
            );

            alert("Delivery accepted");

            await fetchAvailableOrders();
            await fetchMyOrders();
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
            alert(error.response?.data || "Failed to accept delivery");
        }
    };

    const deliveredOrder = async (deliveryId) => {
        try {
            await axios.put(
                `${Url}/delivery/deliver/${deliveryId}`,
                {},
                { headers }
            );

            setMyOrders(prev =>
                prev.map(delivery =>
                    delivery.id === deliveryId
                        ? { ...delivery, deliveryStatus: "DELIVERED" }
                        : delivery
                )
            );

            alert("Order Delivered");
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
            alert(error.response?.data || "Failed to deliver order");
        }
    };
    const paymentComplete = async (orderId) => {
        try {
            const paymentResponse = await axios.get(`${Url}/payment/order/${orderId}`, { headers });
            const payment = paymentResponse.data;

            if (!payment) {
                alert("Payment not found");
                return;
            }

            if (payment.paymentMethod !== "CASH") {
                alert("This is not a cash payment");
                return;
            }

            if (payment.paymentStatus === "COLLECTED") {
                alert("Cash payment already collected");
                navigate("/deliveryHistory");
                return;
            }

            if (payment.paymentStatus !== "PENDING") {
                alert("Cash payment cannot be collected");
                return;
            }

            await axios.put(`${Url}/payment/collect/${payment.id}`, {}, { headers });

            alert("Cash Payment Completed");
            navigate("/deliveryHistory");
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
            alert(error.response?.data || "Failed to collect cash");
        }
    };
    return (
        <div className="orderalert-container">
            <div className="navbar">
                <h3 className="name">QuickBite</h3>
                <ul>
                    <li onClick={() => navigate("/orderAlert")}>Home</li>
                    <li onClick={() => navigate("/profile")}>Profile</li>
                </ul>
            </div>

            <div className="available-orders">
                <h1>Available Orders</h1>

                {orders.length > 0 ? orders.map((delivery) => {
                    const data = details[delivery.id];

                    return (
                        <div className="order-card" key={delivery.id}>
                            {data && (
                                <>
                                    {data.foodItems.map((item, index) => (
                                        <div key={item.id || index}>
                                            <p><strong>Food:</strong> {item.food?.foodName}</p>
                                            <p><strong>Quantity:</strong> {item.quantity}</p>
                                            <p><strong>Price:</strong> ₹{item.price}</p>
                                            <p><strong>Total Price:</strong> ₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}

                                    <p><strong>Total Amount:</strong> ₹{data.order?.totalAmount}</p>
                                    <p><strong>Delivery Fee:</strong> ₹{data.order?.deliveryFee}</p>
                                    <p><strong>Amount you get:</strong> ₹{(data.order?.deliveryFee * 0.75).toFixed(2)}</p>
                                    <p><strong>Customer Address:</strong> {data.customer?.address}</p>
                                    <p><strong>Customer Latitude:</strong> {data.customer?.latitude}</p>
                                    <p><strong>Customer Longitude:</strong> {data.customer?.longitude}</p>
                                    <p><strong>Restaurant:</strong> {data.restaurant?.restaurantName}</p>
                                    <p><strong>Restaurant Address:</strong> {data.restaurant?.restaurantAddress}</p>
                                    <p><strong>Owner Latitude:</strong> {data.restaurant?.latitude}</p>
                                    <p><strong>Owner Longitude:</strong> {data.restaurant?.longitude}</p>
                                </>
                            )}

                            <button
                                className="accept-btn"
                                onClick={() => acceptOrder(delivery.id)}
                            >
                                Accept Order
                            </button>
                        </div>
                    );
                }) : <h2>No Available Orders</h2>}
            </div>

            <div className="my-orders">
                <h1>My Deliveries</h1>

                {myOrders.length > 0 ? myOrders.map((delivery) => {
                    const data = details[delivery.id];

                    return (
                        <div className="order-card" key={delivery.id}>
                            {data && (
                                <>
                                    {data.foodItems.map((item, index) => (
                                        <div key={item.id || index}>
                                            <p><strong>Food:</strong> {item.food?.foodName}</p>
                                            <p><strong>Quantity:</strong> {item.quantity}</p>
                                            <p><strong>Price:</strong> ₹{item.price}</p>
                                            <p><strong>Total Price:</strong> ₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}

                                    <p><strong>Total Amount:</strong> ₹{data.order?.totalAmount}</p>
                                    <p><strong>Customer Address:</strong> {data.customer?.address}</p>
                                    <p><strong>Customer Phoneno:</strong> {data.customer?.phoneNo}</p>
                                    <p><strong>Customer Latitude:</strong> {data.customer?.latitude}</p>
                                    <p><strong>Customer Longitude:</strong> {data.customer?.longitude}</p>
                                    <p><strong>Restaurant:</strong> {data.restaurant?.restaurantName}</p>
                                    <p><strong>Restaurant Address:</strong> {data.restaurant?.restaurantAddress}</p>
                                    <p><strong>Owner phoneno:</strong> {data.owner?.phoneNo}</p>
                                    <p><strong>Owner Latitude:</strong> {data.restaurant?.latitude}</p>
                                    <p><strong>Owner Longitude:</strong> {data.restaurant?.longitude}</p>

                                    {predictedTimes[delivery.id] !== undefined && (
                                        <p><strong>Predicted Delivery Time:</strong> {predictedTimes[delivery.id]} minutes</p>
                                    )}

                                    {deliveryDeadlines[delivery.id] && (
                                        <p><strong>Expected Delivery Time:</strong> {getExpectedDeliveryTime(delivery.id)}</p>
                                    )}

                                    {delivery.deliveryTime && (
                                        <p><strong>Delivery Time:</strong> {delivery.deliveryTime}</p>
                                    )}
                                </>
                            )}

                            {delivery.deliveryStatus !== "DELIVERED" && isDeliveryTimeReached(delivery.id) && (
                                <button
                                    className="deliver-btn"
                                    onClick={() => deliveredOrder(delivery.id)}
                                >
                                    Delivered
                                </button>
                            )}

                            {delivery.deliveryStatus === "DELIVERED" && data?.payment?.paymentMethod === "CASH" &&(
                                <button
                                    className="payment-btn"
                                    onClick={() => paymentComplete(delivery.orderId)}
                                >
                                    Cash Collected
                                </button>
                            )}
                        </div>
                    );
                }) : <h2>No Deliveries Yet</h2>}
            </div>
        </div>
    );
}

export default OrderAlert;