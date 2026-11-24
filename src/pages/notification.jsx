
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

function Notification() {
    const navigate = useNavigate();
    const GATEWAY_URL = "http://localhost:8080";
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!localUser || !token) {
            navigate("/login");
            return;
        }

        fetchNotifications();
        const timer = setInterval(fetchNotifications, 5000);
        return () => clearInterval(timer);
    }, [navigate]);

    const fetchNotifications = async () => {
        try {
            const localUser = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");

            if (!localUser || !token) return;

            const headers = { Authorization: `Bearer ${token}` };

            const orderResponse = await axios.get(
                `${GATEWAY_URL}/order/user/${localUser.id}?page=0&size=1000`,
                { headers }
            );

            console.log("ORDERS RESPONSE:", orderResponse.data);

            const orders = orderResponse.data?.content || [];

            console.log("TOTAL ORDERS:", orders.length);
            console.log("ORDER STATUSES:", orders.map(order => ({
                id: order.id,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus
            })));

            const currentOrder = orders
                .filter(order => ["PLACED", "ACCEPTED"].includes(order.status?.toUpperCase()))
                .sort((a, b) => b.id - a.id)[0];

            console.log("CURRENT ACTIVE ORDER:", currentOrder);
            if (!currentOrder) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            const notificationList = [];
            let orderItems = [];

            try {
                const itemResponse = await axios.get(
                    `${GATEWAY_URL}/orderItem/order/${currentOrder.id}`,
                    { headers }
                );
                orderItems = itemResponse.data?.content || [];
            } catch (error) {
                console.log("Failed to get current order items:", error);
            }

            const foodNames = await Promise.all(
                orderItems.map(async item => {
                    try {
                        const foodResponse = await axios.get(
                            `${GATEWAY_URL}/food/${item.foodId}`,
                            { headers }
                        );
                        return foodResponse.data?.foodName
                            ? `${foodResponse.data.foodName} x${item.quantity}`
                            : null;
                    } catch (error) {
                        console.log("Failed to get food:", error);
                        return null;
                    }
                })
            );

            let payment = null;

            try {
                const paymentResponse = await axios.get(
                    `${GATEWAY_URL}/payment/order/${currentOrder.id}`,
                    { headers }
                );
                console.log("PAYMENT RESPONSE:", paymentResponse.data);
                payment = paymentResponse.data;
            } catch (error) {
                console.log("Failed to get payment details:", error);
            }

            const paymentStatus = payment?.paymentStatus?.toUpperCase();

            if (payment) {
                notificationList.push({
                    id: `payment-${currentOrder.id}`,
                    type: "payment",
                    orderId: currentOrder.id,
                    title: ["SUCCESS", "COMPLETED", "PAID", "COLLECTED"].includes(paymentStatus)
                        ? "Payment Successful"
                        : payment.paymentMethod?.toUpperCase() === "CASH"
                            ? "Cash Payment Pending"
                            : "Payment Pending",
                    foods: foodNames.filter(Boolean),
                    paymentMethod: payment.paymentMethod || "Not Available",
                    amount: payment.amount ?? currentOrder.totalAmount
                });
            }
            try {
                const deliveryResponse = await axios.get(
                    `${GATEWAY_URL}/delivery/delivery_order_id/${currentOrder.id}`,
                    { headers }
                );
                console.log("DELIVERY RESPONSE:", deliveryResponse.data);
                const deliveries = Array.isArray(deliveryResponse.data)
                    ? deliveryResponse.data
                    : deliveryResponse.data?.content || [];

                const delivery = deliveries.find(item =>
                    item.deliveryAgentId > 0 &&
                    item.deliveryStatus?.toUpperCase() === "ACCEPTED_BY_AGENT"
                );

                if (delivery) {
                    let deliveryAgent = null;

                    try {
                        const agentResponse = await axios.get(
                            `${GATEWAY_URL}/user/${delivery.deliveryAgentId}`,
                            { headers }
                        );
                        deliveryAgent = agentResponse.data;
                    } catch (error) {
                        console.log("Failed to get delivery agent:", error);
                    }

                    const savedDeadline = localStorage.getItem(
                        `deliveryDeadline_${currentOrder.id}`
                    );

                    notificationList.push({
                        id: `delivery-${currentOrder.id}`,
                        type: "delivery",
                        orderId: currentOrder.id,
                        title: "Order Accepted for Delivery",
                        deliveryBoy: deliveryAgent?.name || "Delivery Boy",
                        deliveryTime: savedDeadline
                            ? new Date(savedDeadline).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            : "Not Available"
                    });
                }
            } catch (error) {
                console.log("Failed to get current delivery details:", error);
            }

            const knownIds = JSON.parse(
                localStorage.getItem("qbKnownNotificationIds") || "[]"
            );
            const readIds = JSON.parse(
                localStorage.getItem("qbReadNotificationIds") || "[]"
            );

            const updatedKnownIds = [
                ...new Set([
                    ...knownIds,
                    ...notificationList.map(notification => notification.id)
                ])
            ];

            localStorage.setItem(
                "qbKnownNotificationIds",
                JSON.stringify(updatedKnownIds)
            );

            const unreadIds = updatedKnownIds.filter(
                id => !readIds.includes(id)
            );

            localStorage.setItem(
                "unreadNotificationCount",
                String(unreadIds.length)
            );

            setNotifications(notificationList);
            setLoading(false);
        } catch (error) {
            console.log("Notification error:", error);
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <h3 className="name">QuickBite</h3>
                <ul>
                    <li onClick={() => navigate("/dashboard")}>Home</li>
                    <li onClick={() => navigate("/about")}>Know-Us</li>
                    <li onClick={() => navigate("/profile")}>Profile</li>
                </ul>
            </div>

            <h1 className="dashboard-title">Notifications</h1>

            <div className="food-grid">
                {loading ? (
                    <h2>Loading...</h2>
                ) : notifications.length === 0 ? (
                    <h2>No Notifications</h2>
                ) : (
                    notifications.map(notification => (
                        <div className="food-card" key={notification.id}>
                            <div className="food-content">
                                {notification.type === "payment" ? (
                                    <>
                                        <h2>{notification.title}</h2>
                                        <p><b>Order:</b> #{notification.orderId}</p>
                                        <p><b>Food:</b> {notification.foods.length > 0 ? notification.foods.join(", ") : "Food"}</p>
                                        <p><b>Payment Method:</b> {notification.paymentMethod}</p>
                                        <p className="food-price"><b>Amount:</b> ₹{notification.amount}</p>
                                    </>
                                ) : (
                                    <>
                                        <h2>{notification.title}</h2>
                                        <p><b>Order:</b> #{notification.orderId}</p>
                                        <p><b>Delivery Boy:</b> {notification.deliveryBoy}</p>
                                        <p><b>Expected Delivery:</b> {notification.deliveryTime}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="footer">
                <p>© 2026 QuickBite</p>
            </div>
        </div>
    );
}

export default Notification;
