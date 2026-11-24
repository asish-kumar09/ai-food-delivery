import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, 
     FaGraduationCap, FaChartLine, FaBullseye,  FaClock} from "react-icons/fa";
import "../css/login.css";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "", password: "" });

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberEmail");
        if (savedEmail) {
            setFormData((prev) => ({
                ...prev,
                email: savedEmail
            }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }
        if (!formData.password.trim()) {
            setError("Password is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:8080/user/login",
                null,
                {
                    params: {
                        email: formData.email,
                        password: formData.password
                    }
                }
            );

            const token = response.data.token;
            const user = response.data.user;
            if (!user || !user.id) {
                setError("Invalid response from server");
                return;
            }
            const safeUser = {
                id: user.id,name: user.name, email: user.email, role: user.role
            };
            localStorage.setItem(
                "user",
                JSON.stringify(safeUser)
            );
            localStorage.setItem("token", token);
            if (rememberMe) {
                localStorage.setItem(
                    "rememberEmail",
                    formData.email
                );
            } else {
                localStorage.removeItem("rememberEmail");
            }
            setSuccess("Login Successful");
            setTimeout(() => {
                switch (user.role) {
                    case "CUSTOMER":
                        navigate("/dashboard");
                        break;
                    case "OWNER":
                        navigate("/orderPage");
                        break;
                    case "DELIVERY_AGENT":
                        navigate("/orderAlert");
                        break;
                    case "ADMIN":
                        navigate("/income");
                        break;
                    default:
                        navigate("/");
                }
            }, 1000);

        } catch (error) {
            console.error(error);
            setError("Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                {/* Left Side */}
                <div className="hero-section">
                    <div className="animated-blobs"></div>
                    <div className="hero-content">
                        <div className="brand">
                            <span className="logo-dot"></span>
                            <h1>QuickBite</h1>
                        </div>
                        <h2>
                            Delivering happiness <br />
                            to your doorstep
                        </h2>

                        <div className="floating-elements">
                            <div className="glass-card f-1">🍔 Lightning Fast</div>
                            <div className="glass-card f-2">🍕 Premium Quality</div>
                            <div className="glass-card f-3">⭐ 4.9 Rating</div>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="form-section">
                    <form className="auth-card" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h2>Welcome Back</h2>
                            <p>Enter your details to access your account</p>
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    required
                                />
                                <div
                                    className="eye-icon"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-options">
                            

                            <a  className="forgot-link"  onClick={() => navigate("/forgot")}>
                                Forgot Password?
                            </a>
                        </div>

                        <button type="submit" className="main-btn">
                            Login to Account
                        </button>

                        <p className="redirect-text">
                            New here?{" "}
                            <span
                                onClick={() => navigate("/signup")}
                            >
                                Create an account
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;