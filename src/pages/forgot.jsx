import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/forgot.css";

function Forgot() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const verifyEmail = async (e) => {
        e.preventDefault();
        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.get(
                `http://localhost:8080/user/email/${encodeURIComponent(trimmedEmail)}`
            );

            setUserId(response.data.id);
            setStep(2);

        } catch (err) {
            setError(
                err.response?.data || "Email not found"
            );
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("Please enter both passwords");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            await axios.put(
                `http://localhost:8080/user/reset-password/${userId}`,
                {
                    email: email,
                    password: password
                }
            );

            alert("Password reset successfully");

            navigate("/login");

        } catch (err) {
            setError(
                err.response?.data || "Password reset failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-container">

            <div className="forgot-card">

                <h2>Forgot Password</h2>

                {step === 1 && (
                    <form onSubmit={verifyEmail}>

                        <p>
                            Enter your registered email address
                        </p>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {error && (
                            <p className="error">
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={loading}>
                            {loading ? "Checking..." : "Verify Email"}
                        </button>

                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={resetPassword}>

                        <p>
                            Create your new password
                        </p>

                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                        />

                        {error && (
                            <p className="error">
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Reset Password"}
                        </button>

                    </form>
                )}

            </div>

        </div>
    );
}

export default Forgot;