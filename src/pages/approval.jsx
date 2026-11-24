import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/approval.css";
import { useNavigate } from "react-router-dom";

function Approval() {
    const navigate = useNavigate();
    const GATEWAY_URL = "http://localhost:8080";
    const [restaurants, setRestaurants] = useState([]);
    const [owners, setOwners] = useState({});
    const [admins, setAdmins] = useState({});
    useEffect(() => {
        fetchRestaurants();
    }, []);
    const fetchRestaurants = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get(
                `${GATEWAY_URL}/restaurant/admin/pending`,
                config
            );
            const restaurantList = response.data?.content || [];
            setRestaurants(restaurantList);
            for (const restaurant of restaurantList) {
                const ownerResponse = await axios.get(
                    `${GATEWAY_URL}/user/${restaurant.ownerId}`,
                    config
                );
                setOwners(prev => ({
                    ...prev,
                    [restaurant.id]: ownerResponse.data
                }));
                const adminResponse = await axios.get(
                    `${GATEWAY_URL}/admin/restaurant/${restaurant.id}`,
                    config
                );
                setAdmins(prev => ({
                    ...prev,
                    [restaurant.id]: adminResponse.data
                }));
            }
        } catch (error) {
            console.log("Error fetching approval details:", error);
        }
    };
    const handleApprove = async (restaurantId) => {
        try {
            const token = localStorage.getItem("token");

            console.log("CLICKED APPROVE:", restaurantId);

            const response = await axios.put(
                `${GATEWAY_URL}/admin/approve/${restaurantId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("APPROVE RESPONSE:", response.status);
            console.log("APPROVE DATA:", response.data);

            setRestaurants(prev =>
                prev.filter(r => r.id !== restaurantId)
            );

        } catch (error) {
            console.log("APPROVE ERROR:", error);
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);
        }
    };
    const handleReject = async (restaurantId) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.put(
                `${GATEWAY_URL}/admin/reject/${restaurantId}`,
                {},
                config
            );

            fetchRestaurants();
        } catch (error) {
            console.error("Reject failed:", error);
        }
    };
    return (
        <div className="approval-container">
            <div className="navbar">
                <h3 className="name">QuickBite</h3>
                <ul>
                    <li onClick={() => navigate("/income")}>Home</li>
                    <li onClick={() => navigate("/about")}>Know-Us</li>
                    <li onClick={() => navigate("/login")}>Login</li>
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
            <h1 className="approval-title">Restaurant Partner Approval</h1>
            <div className="approval-grid">
                {restaurants.length === 0 ? (
                    <p>No pending restaurant requests.</p>
                ) : (
                    restaurants.map((restaurant) => {
                        const owner = owners[restaurant.id];
                        const admin = admins[restaurant.id];
                        return (
                            <div className="approval-card" key={restaurant.id}>
                                <div className="approval-content">
                                    <h2>{restaurant.restaurantName}</h2>
                                    <p>Restaurant ID: {restaurant.id}</p>
                                    <p>Restaurant Address: {restaurant.restaurantAddress}</p>
                                    <p>Owner: {owner?.name || "Loading..."}</p>
                                    <p>Email: {owner?.email || "Loading..."}</p>
                                    <p>Phone: {owner?.phoneNo || "Loading..."}</p>
                                    <p>Status: {restaurant.adminStatus}</p>
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleApprove(restaurant.id)}
                                    >
                                        Approve
                                    </button>

                                    <button
                                        className="reject-btn"
                                        onClick={() => handleReject(restaurant.id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="footer">
                <p>© 2026 QuickBite</p>
            </div>
        </div>
    );
}
export default Approval;