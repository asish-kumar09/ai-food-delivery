import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/income.css";

function GrowthPage() {
    const navigate = useNavigate();
    const GATEWAY_URL = "http://localhost:8080";
    const [growth, setGrowth] = useState({ todayIncome: 0, weekIncome: 0, monthIncome: 0, yearIncome: 0, weekGrowth: 0, monthGrowth: 0 });

    useEffect(() => {
        const fetchIncome = async () => {
            try {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user"));
                const headers = { Authorization: `Bearer ${token}` };
                const [todayResponse, weekResponse, monthResponse, yearResponse] = await Promise.all([
                    axios.get(`${GATEWAY_URL}/order/income/delivery/today/${user.id}`, { headers }),
                    axios.get(`${GATEWAY_URL}/order/income/delivery/week/${user.id}`, { headers }),
                    axios.get(`${GATEWAY_URL}/order/income/delivery/month/${user.id}`, { headers }),
                    axios.get(`${GATEWAY_URL}/order/income/delivery/year/${user.id}`, { headers })
                ]);
                setGrowth({
                    todayIncome: todayResponse.data,
                    weekIncome: weekResponse.data,
                    monthIncome: monthResponse.data,
                    yearIncome: yearResponse.data,
                    weekGrowth: 0,
                    monthGrowth: 0
                });
            } catch (error) {
                console.log(error);
                console.log(error.response?.data);
            }
        };
        fetchIncome();
    }, []);

    return (
        <div className="growth-container">
            <div className="navbar"><h3 className="name">QuickBite</h3><ul><li onClick={() => navigate("/dashboard")}>Home</li><li onClick={() => navigate("/profile")}>Profile</li></ul></div>
            <div className="middle-part">
                <h1>Restaurant Growth</h1>
                <div className="income-card"><h2>Today's Income</h2><h1>₹ {growth.todayIncome}</h1></div>
                <div className="income-card"><h2>This Week Income</h2><h1>₹ {growth.weekIncome}</h1></div>
                <div className="income-card"><h2>This Month Income</h2><h1>₹ {growth.monthIncome}</h1></div>
                <div className="income-card"><h2>This Year Income</h2><h1>₹ {growth.yearIncome}</h1></div>
                <div className="chart-section">
                    <div className="circle-box">
                        <h2>Weekly Growth</h2>
                        <div className="circle">
                            <svg width="180" height="180">
                                <circle cx="90" cy="90" r="70" stroke="#ddd" strokeWidth="15" fill="none" />
                                <circle cx="90" cy="90" r="70" stroke="green" strokeWidth="15" fill="none" strokeDasharray={440} strokeDashoffset={440 - (440 * growth.weekGrowth) / 100} transform="rotate(-90 90 90)" />
                                <text x="90" y="98" textAnchor="middle" fontSize="25">{growth.weekGrowth}%</text>
                            </svg>
                        </div>
                        <p>Compared with Previous Week</p>
                    </div>
                    <div className="circle-box">
                        <h2>Monthly Growth</h2>
                        <div className="circle">
                            <svg width="180" height="180">
                                <circle cx="90" cy="90" r="70" stroke="#ddd" strokeWidth="15" fill="none" />
                                <circle cx="90" cy="90" r="70" stroke="orange" strokeWidth="15" fill="none" strokeDasharray={440} strokeDashoffset={440 - (440 * growth.monthGrowth) / 100} transform="rotate(-90 90 90)" />
                                <text x="90" y="98" textAnchor="middle" fontSize="25">{growth.monthGrowth}%</text>
                            </svg>
                        </div>
                        <p>Compared with Previous Month</p>
                    </div>
                </div>
            </div>
            <div className="footer"><p>© 2026 QuickBite</p></div>
        </div>
    );
}

export default GrowthPage;