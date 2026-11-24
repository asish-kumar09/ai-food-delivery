
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/history.css";

function History() {
    const navigate = useNavigate();
    const location = useLocation();
    const GATEWAY_URL = "http://localhost:8080";

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!user || !token) {
            navigate("/login");
            return;
        }

        const getHistory = async () => {
            try {
                const orderResponse = await axios.get(
                    `${GATEWAY_URL}/order/user/${user.id}?page=0&size=1000`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const backendOrders = orderResponse.data.content || [];

                const historyOrders = await Promise.all(
                    backendOrders.map(async (order) => {
                        let orderItems = [];
                        let deliveryAgent = null;

                        try {
                            const orderItemResponse = await axios.get(
                                `${GATEWAY_URL}/orderItem/order/${order.id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            );

                            orderItems = orderItemResponse.data.content || [];
                        } catch (error) {
                            console.error(
                                `Failed to get items for order ${order.id}`,
                                error
                            );
                        }

                        try {
                            const deliveryResponse = await axios.get(
                                `${GATEWAY_URL}/delivery/delivery_order_id/${order.id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            );

                            console.log("Delivery response:", deliveryResponse.data);

                            const delivery = deliveryResponse.data.content?.[0];

                            if (delivery?.deliveryAgentId > 0) {
                                const agentResponse = await axios.get(
                                    `${GATEWAY_URL}/user/${delivery.deliveryAgentId}`,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    }
                                );

                                deliveryAgent = agentResponse.data;
                            }
                        } catch (error) {
                            console.error(
                                `Failed to get delivery agent for order ${order.id}`,
                                error.response?.status,
                                error.response?.data
                            );
                        }

                        const foodItems = await Promise.all(
                            orderItems.map(async (item) => {
                                try {
                                    const foodResponse = await axios.get(
                                        `${GATEWAY_URL}/food/${item.foodId}`,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`
                                            }
                                        }
                                    );

                                    return {
                                        ...item,
                                        food: foodResponse.data
                                    };
                                } catch (error) {
                                    console.error(
                                        `Failed to get food ${item.foodId}`,
                                        error
                                    );

                                    return {
                                        ...item,
                                        food: null
                                    };
                                }
                            })
                        );

                        return {
                            ...order,
                            foodItems: foodItems,
                            deliveryAgent: deliveryAgent
                        };
                    })
                );

                setOrders(historyOrders);
                setLoading(false);
            } catch (error) {
                console.error("History error:", error);
                setLoading(false);
            }
        };

        getHistory();
    }, [navigate]);

    const getColor = (status) => {
        if (status === "DELIVERED") return "green";
        if (status === "COMPLETED") return "green";
        if (status === "CANCELLED") return "red";
        if (status === "REJECTED") return "red";
        if (status === "OUT_FOR_DELIVERY") return "orange";
        return "blue";
    };

    return (
        <div className="history-container">
            <div className="navbar"><h3 className="name">QuickBite</h3><ul><li onClick={() => navigate("/dashboard")}>Home</li><li onClick={() => navigate("/profile")}>Profile</li></ul></div>
            <div className="middle-part">
                <h1>Order History</h1>
                {
                    loading ?
                        <h2>Loading...</h2>
                        :
                        orders.length > 0 ?
                            orders.slice().reverse().map((order) => (
                                <div key={order.id} className="history-card">
                                    <div className="history-details">
                                        <h2>Order #{order.id}</h2>
                                        {
                                            order.foodItems.map((item) => (
                                                <div key={item.id}>
                                                    <p><b>Food :</b> {item.food?.foodName || "Food"}</p>
                                                    <p><b>Price :</b> ₹{item.price}</p>
                                                    <p><b>Quantity :</b> {item.quantity}</p>
                                                    <p><b>Total :</b> ₹{item.totalPrice}</p>
                                                </div>
                                            ))
                                        }
                                        <p><b>Order Amount :</b> ₹{order.totalAmount}</p>
                                        <p><b>Status :</b> <span style={{ color: getColor(order.status) }}>{order.status}</span></p>
                                        <p><b>Order Time :</b> {order.createdAt}</p>
                                        <p><b>Delivered By :</b> {order.deliveryAgent?.name || "Not Assigned"}</p>
                                        <p><b>Agent no: :</b> {order.deliveryAgent?.phoneNo || "Not Assigned"}</p>
                                    </div>
                                </div>
                            ))
                            :
                            <h2>No Previous Orders</h2>
                }
            </div>
            <div className="footer"><p>© 2026 QuickBite</p></div>
        </div>
    );
}

export default History;

