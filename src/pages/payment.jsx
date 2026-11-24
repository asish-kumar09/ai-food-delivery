import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/payment.css";

function Payment() {
    const location = useLocation();
    const navigate = useNavigate();

    const GATEWAY_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const {
        foodItems = [],
        restaurantId = "",
        orderId: initialOrderId = ""
    } = location.state || {};

    const [foods, setFoods] = useState([]);
    const [orderId, setOrderId] = useState(initialOrderId);
    const [distanceFee, setDistanceFee] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("ONLINE");
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customizations, setCustomizations] = useState({});
    const [customizeVisible, setCustomizeVisible] = useState({});
    const creatingOrder = useRef(false);

    useEffect(() => {
        const getFoodDetails = async () => {
            try {
                const foodData = await Promise.all(
                    foodItems.map(async (item) => {
                        const response = await axios.get(
                            `${GATEWAY_URL}/food/${item.foodId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );

                        return {
                            ...response.data,
                            quantity: item.quantity
                        };
                    })
                );

                setFoods(foodData);
            } catch (error) {
                console.error("Error fetching food details:", error);
                alert("Failed to load food details");
            }
        };

        if (foodItems.length > 0) {
            getFoodDetails();
        }
    }, []);

    useEffect(() => {
        const createOrder = async () => {
            if (
                orderId ||
                creatingOrder.current ||
                !user?.id ||
                !restaurantId ||
                foodItems.length === 0
            ) {
                return;
            }

            creatingOrder.current = true;

            try {
                const orderResponse = await axios.post(
                    `${GATEWAY_URL}/order/add`,
                    {
                        userId: user.id,
                        restaurantId: restaurantId,
                        deliveryAddress: user.address
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const createdOrder = orderResponse.data;
                const createdOrderId = createdOrder.id;

                setOrderId(createdOrderId);

                for (const item of foodItems) {
                    const food = foods.find((f) => f.id === item.foodId);

                    if (!food) {
                        continue;
                    }

                    await axios.post(
                        `${GATEWAY_URL}/orderItem/add`,
                        {
                            orderId: createdOrderId,
                            foodId: item.foodId,
                            quantity: item.quantity,
                            price: food.price,
                            totalPrice: food.price * item.quantity,
                            customization: customizations[item.foodId]?.trim() || null
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                }

                const feeResponse = await axios.get(
                    `${GATEWAY_URL}/order/delivery-fee/${createdOrderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setDistanceFee(feeResponse.data);
            } catch (error) {
                console.error("Order creation error:", error);
                alert("Failed to create order");
            }
        };

        if (foods.length > 0) {
            createOrder();
        }
    }, [foods]);

    const foodAmount = foods.reduce(
        (total, food) => total + food.price * food.quantity,
        0
    );

    const totalAmount = foodAmount + Number(distanceFee);

    const addMoreFood = () => {
        navigate("/dashboard", {
            state: {
                foodItems: foodItems,
                distanceFee: distanceFee,
                restaurantId: restaurantId,
                orderId: orderId
            }
        });
    };
    const saveCustomizations = async () => {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${GATEWAY_URL}/orderItem/order/${orderId}?page=0&size=100`, { headers });
        for (const item of res.data.content) {
            const customization = customizations[item.foodId]?.trim();
            if (customization) await axios.put(`${GATEWAY_URL}/orderItem/update/${item.id}`, { ...item, customization }, { headers });
        }
    };
    const handlePayment = async () => {
        if (!orderId) {
            alert("Order ID not found");
            return;
        }

        setLoading(true);
        await saveCustomizations();
        try {
            if (paymentMethod === "ONLINE") {
                const response = await axios.post(
                    `${GATEWAY_URL}/payment/create/${orderId}?paymentMethod=ONLINE`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const paymentData = response.data;
                setPayment(paymentData);

                const statusResponse = await axios.put(
                    `${GATEWAY_URL}/payment/status/${paymentData.id}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setPayment(statusResponse.data);

                alert(
                    `Payment Successful\nTransaction ID: ${statusResponse.data.transactionId}`
                );

                navigate("/history", {
                    state: {
                        orderId: orderId,
                        payment: statusResponse.data
                    }
                });

                return;
            }

            if (paymentMethod === "CASH") {
                const response = await axios.post(
                    `${GATEWAY_URL}/payment/create/${orderId}?paymentMethod=CASH`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setPayment(response.data);

                alert(
                    "Order placed successfully.\nCash will be collected by the delivery agent."
                );

                navigate("/history", {
                    state: {
                        orderId: orderId,
                        payment: response.data
                    }
                });

                return;
            }
        } catch (error) {
            console.error("Payment error:", error);

            if (payment?.id) {
                try {
                    await axios.put(
                        `${GATEWAY_URL}/payment/failed/${payment.id}`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                } catch (failedError) {
                    console.error(
                        "Failed payment update error:",
                        failedError
                    );
                }
            }

            alert("Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <h2>Payment</h2>

                <div className="food-section">
                    <h3>Food Details</h3>

                    {foods.length === 0 ? (
                        <p className="loading-text">Loading food details...</p>
                    ) : (
                        foods.map((food) => (
                            <div className="food-item" key={food.id}>
                                <div>
                                    <p className="food-name">{food.foodName}</p>
                                    <p>Quantity: {food.quantity}</p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCustomizeVisible((prev) => ({
                                                ...prev,
                                                [food.id]: !prev[food.id]
                                            }))
                                        }
                                    >
                                        {customizeVisible[food.id]
                                            ? "Cancel Customization"
                                            : "Customize"}
                                    </button>

                                    {customizeVisible[food.id] && (
                                        <div>
                                            <textarea
                                                placeholder="Example: Less spicy, less onion..."
                                                maxLength={500}
                                                value={customizations[food.id] || ""}
                                                onChange={(e) =>
                                                    setCustomizations((prev) => ({
                                                        ...prev,
                                                        [food.id]: e.target.value
                                                    }))
                                                }
                                            />
                                        </div>
                                    )}
                                </div>

                                <p className="food-price">
                                    ₹{food.price * food.quantity}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="bill-section">
                    <h3>Bill Details</h3>

                    <div className="bill-row">
                        <span>Food Amount</span>
                        <span>₹{foodAmount}</span>
                    </div>

                    <div className="bill-row">
                        <span>Distance Fee</span>
                        <span>₹{Number(distanceFee)}</span>
                    </div>

                    <div className="total-row">
                        <span>Total Amount</span>
                        <span>₹{totalAmount}</span>
                    </div>
                </div>

                <button
                    className="payment-button"
                    onClick={addMoreFood}
                    disabled={loading}
                >
                    Add More Food
                </button>

                <div className="payment-method">
                    <h3>Payment Method</h3>

                    <label className="payment-option">
                        <input
                            type="radio"
                            value="ONLINE"
                            checked={paymentMethod === "ONLINE"}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                        />
                        <span>Online Payment</span>
                    </label>

                    <label className="payment-option">
                        <input
                            type="radio"
                            value="CASH"
                            checked={paymentMethod === "CASH"}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                        />
                        <span>Cash on Delivery</span>
                    </label>
                </div>

                <button
                    className="payment-button"
                    onClick={handlePayment}
                    disabled={loading || foods.length === 0 || !orderId}
                >
                    {loading
                        ? paymentMethod === "ONLINE"
                            ? "Processing Payment..."
                            : "Placing Order..."
                        : paymentMethod === "ONLINE"
                            ? "Pay Now"
                            : "Order"}
                </button>

                {payment && payment.paymentStatus === "SUCCESS" && (
                    <div className="success-box">
                        <h3>Payment Successful</h3>
                        <p>Transaction ID: {payment.transactionId}</p>
                        <p>Amount Paid: ₹{payment.amount}</p>
                    </div>
                )}

                {payment &&
                    payment.paymentMethod === "CASH" &&
                    payment.paymentStatus === "PENDING" && (
                        <div className="success-box">
                            <h3>Order Placed</h3>
                            <p>Payment Method: Cash</p>
                            <p>Cash will be collected by the delivery agent.</p>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default Payment;