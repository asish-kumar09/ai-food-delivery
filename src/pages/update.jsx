import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaUtensils,
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";
import "../css/update.css";

function Update() {
    const navigate = useNavigate();
    const GATEWAY_URL = "http://localhost:8080";

    const [showPassword, setShowPassword] = useState(false);
    const [existingRestaurant, setExistingRestaurant] = useState(null);

    const localUser = JSON.parse(localStorage.getItem("user")) || {};
    const rawToken = localStorage.getItem("token");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        restaurantName: "",
        restaurantAddress: "",
        phoneNo: "",
        latitude: "",
        longitude: "",
        password: ""
    });

    const getAuthHeaders = () => {
        if (!rawToken) return null;
        const authHeader = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;
        return {
            Authorization: authHeader,
            "Content-Type": "application/json"
        };
    };

    // Load current restaurant directly from Backend on mount
    useEffect(() => {
        if (!rawToken || !localUser.id) return;

        const headers = getAuthHeaders();
        if (!headers) return;

        if (localUser.role?.toUpperCase() === "OWNER") {
            axios
                .get(`${GATEWAY_URL}/restaurant/owner/${localUser.id}`, { headers })
                .then((res) => {
                    const data = res.data?.content?.[0] || res.data?.[0] || res.data;
                    if (data && (data.id || data.restaurantName)) {
                        setExistingRestaurant(data);
                    }
                })
                .catch((err) => {
                    console.error("Error fetching existing restaurant data:", err.response?.data || err);
                });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const headers = getAuthHeaders();
        if (!headers) {
            alert("Session expired. Please log in again.");
            navigate("/login");
            return;
        }

        try {
            // 1. Build User Payload
            const userPayload = {
                name: formData.name.trim() !== "" ? formData.name.trim() : localUser.name,
                email: formData.email.trim() !== "" ? formData.email.trim() : localUser.email,
                phoneNo: formData.phoneNo.trim() !== "" ? formData.phoneNo.trim() : localUser.phoneNo,
                address: formData.address.trim() !== "" ? formData.address.trim() : localUser.address,
                latitude: formData.latitude !== "" ? parseFloat(formData.latitude) : (localUser.latitude || 0),
                longitude: formData.longitude !== "" ? parseFloat(formData.longitude) : (localUser.longitude || 0)
            };

            if (formData.password.trim() !== "") {
                userPayload.password = formData.password.trim();
            }

            const userResponse = await axios.put(
                `${GATEWAY_URL}/user/update/${localUser.id}`,
                userPayload,
                { headers }
            );

            let updatedRestaurantData = null;

            // 2. Build Restaurant Payload (Always includes existing fields if unedited to prevent overwriting with null/empty)
            if (localUser.role?.toUpperCase() === "OWNER") {
                const restId = existingRestaurant?.id;

                const finalName = formData.restaurantName.trim() !== "" 
                    ? formData.restaurantName.trim() 
                    : (existingRestaurant?.restaurantName || localUser.restaurantName || "");

                const finalAddress = formData.restaurantAddress.trim() !== "" 
                    ? formData.restaurantAddress.trim() 
                    : (existingRestaurant?.restaurantAddress || localUser.restaurantAddress || localUser.address || "");

                const restaurantPayload = {
                    restaurantName: finalName,
                    restaurantAddress: finalAddress,
                    latitude: formData.latitude !== "" 
                        ? parseFloat(formData.latitude) 
                        : (existingRestaurant?.latitude || localUser.latitude || 0),
                    longitude: formData.longitude !== "" 
                        ? parseFloat(formData.longitude) 
                        : (existingRestaurant?.longitude || localUser.longitude || 0)
                };

                const targetEndpoint = restId
                    ? `${GATEWAY_URL}/restaurant/update/${restId}`
                    : `${GATEWAY_URL}/restaurant/update/owner/${localUser.id}`;

                const restResponse = await axios.put(targetEndpoint, restaurantPayload, { headers });
                updatedRestaurantData = restResponse?.data || restaurantPayload;
            }

            // 3. Update Local Storage for BOTH User and Restaurant details
            const updatedStorageUser = {
                ...localUser,
                ...(userResponse?.data || userPayload),
                restaurantName: updatedRestaurantData?.restaurantName 
                    || existingRestaurant?.restaurantName 
                    || localUser.restaurantName,
                restaurantAddress: updatedRestaurantData?.restaurantAddress 
                    || existingRestaurant?.restaurantAddress 
                    || localUser.restaurantAddress
            };

            localStorage.setItem("user", JSON.stringify(updatedStorageUser));

            alert("Update Successful!");
            navigate("/profile");

        } catch (error) {
            console.error("UPDATE ERROR:", error.response || error);
            alert("Update failed: " + (error.response?.data?.message || "Server Error"));
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="hero-section">
                    <div className="animated-blobs"></div>
                    <div className="brand">
                        <div className="logo-dot"></div>
                        <h1>QuickBite</h1>
                    </div>
                    <div className="hero-content">
                        <h2>Keep Your Details Fresh.</h2>
                    </div>
                    <div className="floating-elements">
                        <div className="glass-card f-1">Fast Delivery</div>
                        <div className="glass-card f-2">Secure Account</div>
                        <div className="glass-card f-3">Fresh Eats</div>
                    </div>
                </div>

                <div className="form-section">
                    <form className="auth-card" onSubmit={handleSubmit} autoComplete="off">
                        <div className="form-header">
                            <h2>Update Profile</h2>
                            <p>Fill only the fields you want to update</p>
                        </div>

                        <div className="input-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input type="text" name="name" value={formData.name} placeholder="Leave blank to keep current" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Email</label>
                                <div className="input-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input type="email" name="email" value={formData.email} placeholder="Leave blank to keep current" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Phone</label>
                                <div className="input-wrapper">
                                    <FaPhone className="input-icon" />
                                    <input type="text" name="phoneNo" value={formData.phoneNo} placeholder="Leave blank to keep current" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Address</label>
                            <div className="input-wrapper">
                                <FaMapMarkerAlt className="input-icon" />
                                <input type="text" name="address" value={formData.address} placeholder="Leave blank to keep current" onChange={handleChange} />
                            </div>
                        </div>

                        {localUser.role?.toUpperCase() === "OWNER" && (
                            <div className="special-fields">
                                <div className="input-group">
                                    <label>Restaurant Name</label>
                                    <div className="input-wrapper">
                                        <FaUtensils className="input-icon" />
                                        <input type="text" name="restaurantName" value={formData.restaurantName} placeholder="Leave blank to keep current" onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Restaurant Address</label>
                                    <div className="input-wrapper">
                                        <FaMapMarkerAlt className="input-icon" />
                                        <input type="text" name="restaurantAddress" value={formData.restaurantAddress} placeholder="Leave blank to keep current" onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="input-row">
                            <div className="input-group">
                                <label>Latitude</label>
                                <div className="input-wrapper">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input type="number" name="latitude" value={formData.latitude} step="any" placeholder="Leave blank to keep current" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Longitude</label>
                                <div className="input-wrapper">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input type="number" name="longitude" value={formData.longitude} step="any" placeholder="Leave blank to keep current" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>New Password (Optional)</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} placeholder="••••••••" onChange={handleChange} />
                                <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="main-btn">Save Changes</button>
                        <p className="redirect-text">Changed your mind? <span onClick={() => navigate("/profile")}>Go Back</span></p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Update;