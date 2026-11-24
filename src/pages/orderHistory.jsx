import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/orderHistory.css";

function OrderHistory() {
    const navigate = useNavigate();
    const GATEWAY_URL = "http://localhost:8080";

    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [payments, setPayments] = useState({});
    const [users, setUsers] = useState({});
    const [foods, setFoods] = useState({});
    const [deliveryAgents, setDeliveryAgents] = useState({});
    const [loading, setLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");

            if (!user || !token) {
                navigate("/login");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const restaurantResponse = await axios.get(
                `${GATEWAY_URL}/restaurant/owner/${user.id}`,
                { headers }
            );

            const restaurantList = restaurantResponse.data.content || [];

            if (restaurantList.length === 0) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const restaurantId = restaurantList[0].id;

            const orderResponse = await axios.get(
                `${GATEWAY_URL}/order/restaurant/${restaurantId}?page=0&size=100`,
                { headers }
            );

            const orderList = orderResponse.data.content || [];

            const uniqueOrders = Array.from(
                new Set(orderList.map((order) => order.id))
            ).map((id) =>
                orderList.find((order) => order.id === id)
            );

            setOrders(uniqueOrders);

            const itemsData = {};
            const paymentsData = {};
            const usersData = {};
            const foodsData = {};
            const deliveryAgentsData = {};

            let income = 0;
            let completed = 0;

            for (const order of uniqueOrders) {
                const itemResponse = await axios.get(
                    `${GATEWAY_URL}/orderItem/order/${order.id}`,
                    { headers }
                );

                const items = itemResponse.data.content || [];
                itemsData[order.id] = items;

                for (const item of items) {
                    if (!foodsData[item.foodId]) {
                        const foodResponse = await axios.get(
                            `${GATEWAY_URL}/food/${item.foodId}`,
                            { headers }
                        );

                        foodsData[item.foodId] = foodResponse.data;
                    }
                }

                const paymentResponse = await axios.get(
                    `${GATEWAY_URL}/payment/order/${order.id}`,
                    { headers }
                );

                paymentsData[order.id] = paymentResponse.data;

                const userResponse = await axios.get(
                    `${GATEWAY_URL}/user/${order.userId}`,
                    { headers }
                );

                usersData[order.id] = userResponse.data;

                if (order.deliveryAgentId) {
                    const deliveryAgentResponse = await axios.get(
                        `${GATEWAY_URL}/user/${order.deliveryAgentId}`,
                        { headers }
                    );

                    deliveryAgentsData[order.id] =
                        deliveryAgentResponse.data;
                }

                const paymentMethod = paymentsData[order.id]?.paymentMethod?.toUpperCase();
                const paymentStatus = paymentsData[order.id]?.paymentStatus?.toUpperCase();
                const paymentSettled =
                    (paymentMethod === "ONLINE" &&
                        ["SUCCESS", "COMPLETED", "PAID"].includes(paymentStatus)) ||
                    (paymentMethod === "CASH" &&
                        ["COLLECTED", "SUCCESS", "COMPLETED", "PAID"].includes(paymentStatus));
                if (paymentSettled) {
                    income += Number(order.ownerIncome || 0);
                }
                if (order.status === "COMPLETED") {
                    completed++;
                }
            }

            setOrderItems(itemsData);
            setPayments(paymentsData);
            setUsers(usersData);
            setFoods(foodsData);
            setDeliveryAgents(deliveryAgentsData);
            setTotalIncome(income);
            setCompletedOrders(completed);
            setLoading(false);

        } catch (error) {
            console.log(error);
            console.log(error.response?.data);
            setLoading(false);
        }
    };

    const getColor = (status) => {
        if (status === "COMPLETED") return "green";
        if (status === "CANCELLED") return "red";
        if (status === "REJECTED") return "red";
        if (status === "OUT_FOR_DELIVERY") return "orange";
        if (status === "ACCEPTED") return "blue";
        return "blue";
    };

    return (
        <div className="orderhistory-container">

            <div className="navbar"><h3 className="name">QuickBite</h3><ul><li onClick={() => navigate("/dashboard")}>Home</li><li onClick={() => navigate("/profile")}>Profile</li></ul></div>

            <div className="middle-part">

                <h1>Restaurant Order History</h1>

                <div className="summary-card">
                    <h2>Total Completed Orders : {completedOrders}</h2>
                    <h2>Total Income : ₹{totalIncome}</h2>
                </div>

                {
                    loading ?

                    <h2>Loading...</h2>

                    :

                    orders.length > 0 ?

                    orders.slice().reverse().map((order) => (

                        <div key={order.id} className="history-card">

                            <div className="history-details">

                                <h2>Order #{order.id}</h2>

                                <p><b>Customer :</b> {users[order.id]?.name}</p>

                                <p><b>Phone :</b> {users[order.id]?.phoneNo || "Not Available"}</p>

                                <p><b>Address :</b> {users[order.id]?.address}</p>

                                <p><b>Amount :</b> ₹{order?.totalAmount}</p>

                                <p><b>Payment :</b> {payments[order.id]?.paymentMethod}</p>

                                <p><b>Payment Status :</b> {payments[order.id]?.paymentStatus}</p>

                                <p><b>Transaction ID :</b> {payments[order.id]?.transactionId}</p>

                                <p><b>Status :</b> <span style={{ color: getColor(order?.status) }}>{order?.status}</span></p>

                                <p><b>Delivery Agent :</b> {deliveryAgents[order.id]?.name || "Not Assigned"}</p>

                                <p><b>Order Time :</b> {order?.createdAt}</p>

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

                                        </div>

                                    ))}

                                </div>

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

export default OrderHistory;