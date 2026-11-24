import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt, FaUtensils, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/signup.css";

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", role: "CUSTOMER", phoneNo: "",
        latitude: "", longitude: "", restaurantName: "", restaurantAddress: "", address: "",
        open: "", close: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const openTerms = () => { navigate(`/about?role=${formData.role}`); };

    const validateForm = () => {
        if (!formData.role) {
            alert("Please select a role");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            alert("Invalid email address");
            return false;
        }
        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters");
            return false;
        }
        if (!agreed) {
            alert("Please agree to the Terms & Conditions");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const userPayload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phoneNo: formData.phoneNo,
                address: formData.address,

                ...((formData.role === "CUSTOMER" || formData.role === "OWNER") && {
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude)
                })
            };
            const userResponse = await axios.post(
                "http://localhost:8080/user/signup",
                userPayload
            );

            // 2. If OWNER, login to get JWT
            if (formData.role === "OWNER") {

                const loginResponse = await axios.post(
                    "http://localhost:8080/user/login",
                    null,
                    {
                        params: {
                            email: formData.email,
                            password: formData.password
                        }
                    }
                );

                const token = loginResponse.data.token;

                // 3. Create restaurant with JWT
                await axios.post(
                    "http://localhost:8080/restaurant/add",
                    {
                        ownerId: userResponse.data.id,
                        restaurantName: formData.restaurantName,
                        restaurantAddress: formData.restaurantAddress,
                        latitude: parseFloat(formData.latitude),
                        longitude: parseFloat(formData.longitude),
                        open: formData.open,
                        close: formData.close
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }
            console.log("RESTAURANT DATA:", {
                ownerId: userResponse.data.id,
                restaurantName: formData.restaurantName,
                restaurantAddress: formData.restaurantAddress,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                open: formData.open,
                close: formData.close
            });
            alert("Registration Successful");
            navigate("/login");

        } catch (err) {

            console.error("Signup error:", err);

            if (err.response) {
                alert(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : err.response.data?.message || "Registration Failed"
                );
            } else {
                alert("Registration Failed");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="hero-section signup-hero">
                    <div className="animated-blobs second-blob"></div>
                    <div className="hero-content">
                        <div className="brand"><span className="logo-dot"></span><h1>QuickBite</h1></div>
                        <h2>Join the premium<br />food revolution</h2>
                        <p className="hero-subtext">Over 1000+ top-rated restaurants waiting for you.</p>
                    </div>
                </div>

                <div className="form-section">
                    <form className="auth-card" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h2>Create Account</h2>
                            <p>Get started with your free account today</p>
                        </div>

                        {/* Top Shared Section (Name / Phone & Email / Address) */}
                        <div className="input-row">
                            <div className="input-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <FaUser className="input-icon" />
                                    <input type="text" name="name" placeholder="John Doe" required onChange={handleChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Phone</label>
                                <div className="input-wrapper">
                                    <FaPhone className="input-icon" />
                                    <input type="text" name="phoneNo" placeholder="+91..." required onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Email</label>
                                <div className="input-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input type="email" name="email" placeholder="john@example.com" required onChange={handleChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Address</label>
                                <div className="input-wrapper">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input type="text" name="address" placeholder="Your Address" required onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                     
                        <div className="input-group">
                            <label>Account Role</label>
                            <div className="input-wrapper">
                                <select name="role" value={formData.role} onChange={handleChange} className="modern-select">
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="OWNER">Restaurant Owner</option>
                                    <option value="DELIVERY_AGENT">Delivery Boy</option>
                                   
                                </select>
                                <FaChevronDown className="select-icon" />
                            </div>
                        </div>

                      
                        {formData.role === "CUSTOMER" && (
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Latitude</label>
                                    <div className="input-wrapper">
                                        <FaMapMarkerAlt className="input-icon" />
                                        <input type="number" name="latitude" step="any" placeholder="Your latitude" required onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Longitude</label>
                                    <div className="input-wrapper">
                                        <FaMapMarkerAlt className="input-icon" />
                                        <input type="number" name="longitude" step="any" placeholder="Your longitude" required onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                     
                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input type={showPassword ? "text" : "password"} name="password" placeholder="Create Password" required onChange={handleChange} />
                                <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>

                    
                        {formData.role === "OWNER" && (
                            <div className="special-fields">
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Restaurant Name</label>
                                        <div className="input-wrapper">
                                            <FaUtensils className="input-icon" />
                                            <input type="text" name="restaurantName" placeholder="Spice Hub" required onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Restaurant Address</label>
                                        <div className="input-wrapper">
                                            <FaMapMarkerAlt className="input-icon" />
                                            <input type="text" name="restaurantAddress" placeholder="Business Location" required onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Opening Time</label>
                                        <div className="input-wrapper">
                                            <FaMapMarkerAlt className="input-icon" />
                                            <input type="text" name="open"  required onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Closing Time</label>
                                        <div className="input-wrapper">
                                            <FaMapMarkerAlt className="input-icon" />
                                            <input type="text" name="close"  required onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Latitude</label>
                                        <div className="input-wrapper">
                                            <FaMapMarkerAlt className="input-icon" />
                                            <input type="number" name="latitude" step="any" placeholder="Latitude" required onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Longitude</label>
                                        <div className="input-wrapper">
                                            <FaMapMarkerAlt className="input-icon" />
                                            <input type="number" name="longitude" step="any" placeholder="Longitude" required onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="terms-row">
                            <label className="checkbox-container">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                                <span className="checkmark"></span>
                                I agree to the{" "}
                                <span className="terms-link" onClick={openTerms}>Terms & Conditions</span>
                            </label>
                        </div>

                        <button type="submit" className="main-btn" disabled={loading}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        <p className="redirect-text">
                            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;