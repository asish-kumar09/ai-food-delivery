import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReviewModal from "../pages/ReviewModel";
import "../css/profile.css";
function Profile() {
    const navigate = useNavigate();
    const GATEWAY_URL = "http://localhost:8080";

    const [showReview, setShowReview] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        restaurantName: "",
        restaurantAddress: "",
        restaurantId: "",
        phoneNo: "",
        latitude: "",
        longitude: "",
    });

    const [orders, setOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [deliveryAgent, setDeliveryAgent] = useState(null);
    const [deliveryDeadline, setDeliveryDeadline] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [adminIncome, setAdminIncome] = useState(0);
    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!localUser || !token) {
            navigate("/login");
            return;
        }

        axios.get(`${GATEWAY_URL}/user/${localUser.id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {
                const user = response.data;

                setFormData((prev) => ({
                    ...prev,
                    name: user?.name || localUser?.name || "",
                    email: user?.email || localUser?.email || "",
                    role: user?.role || localUser?.role || "",
                    address: user?.address || localUser?.address || "",
                    phoneNo: user?.phoneNo || localUser?.phoneNo || "",
                    latitude: user?.latitude || "",
                    longitude: user?.longitude || ""
                }));

                if (user.role?.toUpperCase() === "OWNER") {
                    axios.get(`${GATEWAY_URL}/restaurant/owner/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
                        .then((res) => {
                            const restaurant = res.data?.content?.[0] || res.data?.[0] || res.data;

                            if (restaurant) {
                                setFormData((prev) => ({
                                    ...prev,
                                    restaurantId: restaurant.id,
                                    restaurantName: restaurant.restaurantName || localUser.restaurantName || "",
                                    restaurantAddress: restaurant.restaurantAddress || localUser.restaurantAddress || "",
                                    adminStatus: restaurant?.adminStatus || "PENDING"
                                }));
                            }
                        })
                        .catch((err) => console.error("Error fetching restaurant:", err));
                }

                if (user.role?.toUpperCase() === "CUSTOMER") {
                    axios.get(`${GATEWAY_URL}/order/user/${user.id}?page=0&size=1000`, { headers: { Authorization: `Bearer ${token}` } })
                        .then((res) => {
                            const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
                            setOrders(data);
                        })
                        .catch((err) => console.error(err));
                }

                if (user.role?.toUpperCase() === "ADMIN") {
                    axios.get(`${GATEWAY_URL}/admin/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
                        .then((res) => {
                            const admin = res.data;

                            if (admin) {
                                setFormData((prev) => ({
                                    ...prev,
                                    restaurantId: admin.restaurantId
                                }));
                            }
                        })
                        .catch((err) => console.error("Error fetching admin:", err));
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to load profile");
            });
    }, [navigate]);
    useEffect(() => {
        if (!currentOrder) {
            setDeliveryDeadline(null);
            return;
        }

        const savedDeadline = localStorage.getItem(`deliveryDeadline_${currentOrder.id}`);

        if (savedDeadline) {
            setDeliveryDeadline(new Date(savedDeadline));
        } else {
            setDeliveryDeadline(null);
        }
    }, [currentOrder]);
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (!currentOrder || !deliveryDeadline) {
            return;
        }

        const status = currentOrder.status?.toUpperCase();

        if (status === "COMPLETED") {
            return;
        }

        if (currentTime >= deliveryDeadline) {
            const newDeadline = new Date(
                deliveryDeadline.getTime() + 2 * 60 * 1000
            );

            setDeliveryDeadline(newDeadline);
            localStorage.setItem(
                `deliveryDeadline_${currentOrder.id}`,
                newDeadline.toISOString()
            );
        }
    }, [currentTime, currentOrder, deliveryDeadline]);
    useEffect(() => {
        if (formData?.role?.toUpperCase() !== "CUSTOMER" || orders.length === 0) {
            return;
        }

        const current = [...orders].reverse().find((order) =>
            ["PLACED", "ACCEPTED"].includes(order?.status?.toUpperCase())
        );

        if (current) {
            setCurrentOrder(current);
        }
    }, [orders, formData?.role]);
    useEffect(() => {
        if (orders.length > 0) {
            const reviewableOrder = orders.find((order) =>
                order?.status?.toUpperCase() === "DELIVERED" &&
                ["SUCCESS", "COMPLETED", "PAID"].includes(order?.paymentStatus?.toUpperCase())
            );

            if (reviewableOrder) {
                setSelectedOrder(reviewableOrder);
                setShowReview(true);
            }
        }
    }, [orders]);

    useEffect(() => {
        if (!currentOrder) {
            setDeliveryAgent(null);
            return;
        }

        const token = localStorage.getItem("token");

        const fetchDeliveryAgent = async () => {
            try {
                const deliveryResponse = await axios.get(`${GATEWAY_URL}/delivery/delivery_order_id/${currentOrder.id}`, { headers: { Authorization: `Bearer ${token}` } });
                const delivery = deliveryResponse.data?.content?.[0];

                if (!delivery || !delivery.deliveryAgentId || delivery.deliveryAgentId <= 0) {
                    setDeliveryAgent(null);
                    return;
                }

                const agentResponse = await axios.get(`${GATEWAY_URL}/user/${delivery.deliveryAgentId}`, { headers: { Authorization: `Bearer ${token}` } });
                setDeliveryAgent(agentResponse.data);
            } catch (err) {
                console.error("Error fetching delivery details:", err);
                setDeliveryAgent(null);
            }
        };

        fetchDeliveryAgent();

        const timer = setInterval(fetchDeliveryAgent, 5000);
        return () => clearInterval(timer);
    }, [currentOrder]);

    useEffect(() => {
        if (formData?.role?.toUpperCase() !== "CUSTOMER") {
            return;
        }

        const localUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!localUser || !token) {
            return;
        }

        const fetchOrders = () => {
            axios.get(`${GATEWAY_URL}/order/user/${localUser.id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then((res) => {
                    const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
                    setOrders(data);
                })
                .catch((err) => console.error("Error refreshing orders:", err));
        };

        fetchOrders();

        const timer = setInterval(fetchOrders, 5000);
        return () => clearInterval(timer);
    }, [formData?.role]);
   
    return (
        <div className="profile-cont">
            {
                formData?.role?.toUpperCase() === "DELIVERY_AGENT" && (
                    <div className="navbar">
                        <h3 className="name">QuickBite</h3>
                        <ul>
                            <li onClick={() => navigate("/orderPage")}>Home</li>
                            <li onClick={() => navigate("/about")}>Terms&Conditions</li>
                            <li onClick={() => navigate("/update")}>Edit-Profile</li>
                            <li onClick={() => navigate("/offerPage")}>Give-Offers</li>
                        </ul>
                    </div>
                )}
            {
                formData?.role?.toUpperCase() === "CUSTOMER" && (

                    <div className="navbar">
                        <h3 className="name">QuickBite</h3>
                        <ul>
                            <li onClick={() => navigate("/dashboard")}>Home</li>
                            <li onClick={() => navigate("/about")}>Know-Us</li>
                            <li onClick={() => navigate("/update")}>Edit-Profile</li>
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
                )}
            {
                formData?.role?.toString().toUpperCase() === "OWNER" && (

                    <div className="navbar">
                        <h3 className="name">QuickBite</h3>
                        <ul>
                            <li onClick={() => navigate("/orderPage")}>Home</li>
                            <li onClick={() => navigate("/about")}>Terms&Conditions</li>
                            <li onClick={() => navigate("/update")}>Edit-Profile</li>
                            <li onClick={() => navigate("/offerPage")}>Give-Offers</li>
                        </ul>
                    </div>)}
            {
                formData?.role?.toString().toUpperCase() === "ADMIN" && (

                    <div className="navbar">
                        <h3 className="name">QuickBite</h3>
                        <ul>
                            <li onClick={() => navigate("/income")}>Home</li>
                            <li onClick={() => navigate("/update")}>Edit-Profile</li>
                        </ul>
                    </div>)}
            <div className="middle-part">
                <h1>Welcome to QuickBite, {formData?.name}</h1>
                <h3>Your Details</h3>
                {
                    formData?.role?.toUpperCase() === "CUSTOMER" && (
                        <>

                            <p>Name: {formData?.name}</p>
                            <p>Email: {formData?.email}</p>
                            <p>Phone-No: {formData?.phoneNo}</p>
                            <div>
                                <h3>Current Order</h3>

                                {currentOrder ? (
                                    <div className="order-card">
                                        <p><b>Order Status:</b> {currentOrder.status}</p>

                                        <p>
                                            <b>Delivery Boy:</b>{" "}
                                            {deliveryAgent?.name || "Not Assigned"}
                                        </p>

                                        <p>
                                            <b>Delivery Boy Phone:</b>{" "}
                                            {deliveryAgent?.phoneNo || "Not Available"}
                                        </p>

                                        {currentOrder.status?.toUpperCase() === "COMPLETED" ? (
                                            <p><b>Food Delivered</b></p>
                                        ) : (
                                            <p>
                                                <b>Expected Delivery Time:</b>{" "}
                                                {deliveryDeadline
                                                    ? deliveryDeadline.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                    : "Not Available"}
                                            </p>
                                        )}

                                        {currentOrder.status?.toUpperCase() === "COMPLETED" && (
                                            <button
                                                className="review-btn"
                                                onClick={() => {
                                                    setSelectedOrder(currentOrder);
                                                    setShowReview(true);
                                                }}
                                            >
                                                Share Experience
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p>No current orders</p>
                                )}
                            </div>

                            <button onClick={() => navigate("/history")}>View History</button>
                        </>
                    )
                }
                {
                    formData?.role?.toString().toUpperCase() === "OWNER" && (
                        <>

                            <p>Name: {formData?.name || "N/A"}</p>
                            <p>Email: {formData?.email || "N/A"}</p>
                            <p>Phone-No: {formData?.phoneNo || "N/A"}</p>
                            <p>Restaurant: {formData?.restaurantName || "N/A"}</p>
                            <p>Restaurant Address: {formData?.restaurantAddress || "N/A"}</p>
                            <p>Admin Status:{formData?.adminStatus || "PENDING"}</p>
                            <button onClick={() => navigate("/addFood")}>Add New Food</button>
                            <button onClick={() => navigate("/orderPage")}>Order Page</button>
                            <button onClick={() => navigate("/orderHistory")}>History</button>
                        </>
                    )
                }
                {
                    formData?.role?.toString().toUpperCase() === "ADMIN" && (
                        <>
                            <p>Name: {formData?.name || "N/A"}</p>
                            <p>Email: {formData?.email || "N/A"}</p>
                            <p>Phone-No: {formData?.phoneNo || "N/A"}</p>
                            
                            <button onClick={() => navigate("/approval")}>Approval</button>
                            
                        </>
                    )
                }
                {
                    formData?.role?.toUpperCase() === "DELIVERY_AGENT" && (
                        <>

                            <p>Name: {formData?.name}</p>
                            <p>Email: {formData?.email}</p>
                            <p>Phone-No: {formData?.phoneNo}</p>
                            <button onClick={() => navigate("/orderAlert")}>Check Orders</button>
                            <button onClick={() => navigate("/deliveryHistory")}>Delivery History</button>
                            <button onClick={() => navigate("/income")}>Incomes</button>
                        </>
                    )
                }
            </div>

            <ReviewModal
                show={showReview}
                order={selectedOrder}
                onClose={() => setShowReview(false)}
                onSuccess={() => window.location.reload()}
            />

            <div className="footer">
                <p>© 2026 QuickBite</p>
            </div>
        </div>
    );
}

export default Profile;