import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/membership.css";

function Membership() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);

    const membershipPlans = [
        {
            id: 1,
            name: "Weekly",
            price: 49,
            dollors: "$1.15",
            duration: "7 Days",
            description: "Perfect for trying QuickBite membership.",
            benefits: [
                "Member-only offers",
                "Discounted delivery charges",
                "Access to selected restaurant offers"
            ]
        },
        {
            id: 2,
            name: "Monthly",
            price: 149,
            dollors: "$3.45",
            duration: "28 Days",
            description: "Enjoy more benefits throughout the month.",
            benefits: [
                "Free delivery on eligible orders",
                "Member-only offers",
                "Higher discount benefits",
                "Exclusive restaurant offers"
            ],
            popular: true
        },
        {
            id: 3,
            name: "Yearly",
            price: 999,
            dollors: "$29",
            duration: "360 Days",
            description: "Best value for regular QuickBite customers.",
            benefits: [
                "All monthly membership benefits",
                "Better delivery discounts",
                "Exclusive membership offers",
                "Priority access to selected offers"
            ]
        }
    ];

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };

    const handlePurchase = () => {
        if (!selectedPlan) {
            alert("Please select a membership plan first.");
            return;
        }

        alert(
            `${selectedPlan.name} membership selected for ₹${selectedPlan.price}.`
        );
    };

    return (
        <div className="membership-page">

            <div className="membership-header">

                <h1>QuickBite Membership</h1>

                <p>
                    Enjoy exclusive offers, delivery benefits and
                    special rewards with QuickBite Membership.
                </p>

            </div>


            {/* Plans */}
            <div className="membership-container">

                {membershipPlans.map((plan) => (

                    <div
                        key={plan.id}
                        className={`membership-card 
                            ${plan.popular ? "popular-plan" : ""}
                            ${selectedPlan?.id === plan.id ? "selected-plan" : ""}
                        `}
                    >

                        {plan.popular && (
                            <div className="popular-badge">
                                MOST POPULAR
                            </div>
                        )}


                        <div className="plan-header">

                            <h2>
                                {plan.name}
                            </h2>

                            <p className="plan-description">
                                {plan.description}
                            </p>

                        </div>


                        <div className="plan-price">

                            <span className="currency">
                                ₹
                            </span>

                            <span className="price">
                                {plan.price}
                            </span>

                        </div>
                        <p className="dollors">
                            {plan.dollors}
                        </p>

                        <p className="duration">
                            
                            Valid for {plan.duration}
                        </p>


                        <div className="benefits">

                            <h3>
                                Membership Benefits
                            </h3>

                            {plan.benefits.map((benefit, index) => (

                                <div
                                    className="benefit"
                                    key={index}
                                >

                                    <span className="check">
                                        ✓
                                    </span>

                                    <span>
                                        {benefit}
                                    </span>

                                </div>

                            ))}

                        </div>


                        <button
                            className="select-btn"
                            onClick={() => handleSelectPlan(plan)}
                        >
                            {selectedPlan?.id === plan.id
                                ? "Selected"
                                : "Select Plan"}
                        </button>

                    </div>

                ))}

            </div>


            {/* Purchase Section */}

            {selectedPlan && (

                <div className="purchase-section">

                    <h2>
                        Selected Plan: {selectedPlan.name}
                    </h2>

                    <p>
                        You are about to purchase the{" "}
                        <strong>
                            {selectedPlan.name}
                        </strong>{" "}
                        membership for{" "}
                        <strong>
                            ₹{selectedPlan.price}
                        </strong>.
                    </p>

                    <button
                        className="purchase-btn"
                        onClick={handlePurchase}
                    >
                        Get Membership
                    </button>

                </div>

            )}


            <div className="membership-notice">

                <h3>
                    Membership Information
                </h3>

                <p>
                    Membership benefits are available only during
                    the active membership period.
                </p>

                <p>
                    Some benefits may apply only to eligible
                    restaurants or orders.
                </p>

                <p>
                    Membership prices and benefits may be modified
                    by QuickBite administration.
                </p>

            </div>


            {/* Footer */}

            <div className="footer">

                <p>
                    © 2026 QuickBite
                </p>

            </div>

        </div>
    );
}

export default Membership;