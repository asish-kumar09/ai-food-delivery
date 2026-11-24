import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/orderpage.css";

function OrderPage() {
    const navigate = useNavigate();
    const Url = "http://localhost:8080";
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [payments, setPayments] = useState({});
    const [users, setUsers] = useState({});
    const [foods, setFoods] = useState({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const restaurantResponse = await axios.get(
                `${Url}/restaurant/owner/${user.id}`,
                { headers }
            );

            const restaurantList = restaurantResponse.data.content;

            if (!restaurantList || restaurantList.length === 0) {
                console.log("No restaurant found");
                setOrders([]);
                return;
            }

            const restaurantId = restaurantList[0].id;

            const response = await axios.get(
                `${Url}/order/restaurant/${restaurantId}?page=0&size=100`,
                { headers }
            );

            const orderList = response.data.content || [];

            const pendingOrders = orderList.filter(
                (order) => order.status === "PLACED"
            );

            const uniqueOrders = Array.from(
                new Set(pendingOrders.map((order) => order.id))
            ).map((id) =>
                pendingOrders.find((order) => order.id === id)
            );

            setOrders(uniqueOrders);

            const itemsData = {};
            const paymentsData = {};
            const usersData = {};
            const foodsData = {};

            for (const order of uniqueOrders) {
                const itemResponse = await axios.get(
                    `${Url}/orderItem/order/${order.id}`,
                    { headers }
                );

                const items = itemResponse.data.content || [];
                itemsData[order.id] = items;

                for (const item of items) {
                    if (!foodsData[item.foodId]) {
                        const foodResponse = await axios.get(
                            `${Url}/food/${item.foodId}`,
                            { headers }
                        );

                        foodsData[item.foodId] = foodResponse.data;
                    }
                }

                const paymentResponse = await axios.get(
                    `${Url}/payment/order/${order.id}`,
                    { headers }
                );

                paymentsData[order.id] = paymentResponse.data;

                const userResponse = await axios.get(
                    `${Url}/user/${order.userId}`,
                    { headers }
                );

                usersData[order.id] = userResponse.data;
            }

            setOrderItems(itemsData);
            setPayments(paymentsData);
            setUsers(usersData);
            setFoods(foodsData);

        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
        }
    };

    const approveOrder = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `${Url}/order/accept/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Order Approved");

            fetchOrders();
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
        }
    };

    const cancelOrder = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `${Url}/order/cancel/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Order Cancelled");

            fetchOrders();
        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
        }
    };

    return (
        <div className="orderpage-container">
            <div className="navbar">
                <h3 className="name">QuickBite</h3>
                <ul>
                    <li onClick={() => navigate("/orderPage")}>Home</li>
                    <li onClick={() => navigate("/addFood")}>Add-New-Item</li>
                    <li onClick={() => navigate("/profile")}>
                        <img
                            src="https://th.bing.com/th/id/OIP.1-zwKjnKoLSmjnuFLQ4MXAHaHa?w=183&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
                            height="30px"
                            width="30px"
                            alt="profile"
                        />
                    </li>
                </ul>
            </div>

            <div className="orderpage-content">
                <h1>Restaurant Orders</h1>

                {orders.length > 0 ? (
                    orders
                        .slice()
                        .reverse()
                        .map((order) => (
                            <div className="order-card" key={order.id}>
                                <div className="order-info-section">
                                    <h2>Order #{order.id}</h2>
                                    <p><strong>Customer:</strong> {users[order.id]?.name}</p>
                                    <p><strong>Address:</strong> {users[order.id]?.address}</p>
                                    <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                                    <p><strong>Status:</strong> {order.status}</p>
                                    <p><strong>Payment Method:</strong> {payments[order.id]?.paymentMethod}</p>
                                    <p><strong>Payment Status:</strong> {payments[order.id]?.paymentStatus}</p>
                                    <p><strong>Transaction ID:</strong> {payments[order.id]?.transactionId}</p>
                                </div>

                                <div className="order-food-items">
                                    <h3>Food Items Ordered</h3>

                                    {orderItems[order.id]?.map((item, index) => (
                                        <div className="food-item-row" key={item.id || index}>
                                            <span>
                                                <strong>
                                                    {foods[item.foodId]?.foodName || `Food ID: ${item.foodId}`}
                                                </strong>
                                            </span>
                                            <span>Qty: {item.quantity}</span>
                                            <span>Customized: {item.customization?.trim() || "None"}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.status === "PLACED" && (
                                    <div className="btn-box">
                                        <button
                                            className="approve-btn"
                                            onClick={() => approveOrder(order.id)}
                                        >
                                            Approve
                                        </button>

                                        <button
                                            className="cancel-btn"
                                            onClick={() => cancelOrder(order.id)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                ) : (
                    <h2>No Orders Found</h2>
                )}
            </div>
        </div>
    );
}

export default OrderPage;