import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../css/about.css";

function About() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role");
    console.log("Terms role:", role);
    const renderTerms = () => {
        if (role === "CUSTOMER") {
            return (
                <div className="terms-section">
                    <h2>User Terms & Conditions</h2>
                    <p>Customers can browse restaurants and available food items through QuickBite.</p>
                    <p>Orders can be placed only when the selected restaurant is accepting orders.</p>
                    <p>Customers should provide accurate delivery address and contact information.</p>
                    <p>Once an order is accepted by the restaurant, cancellation may not always be possible.</p>
                    <p>Customers can track their order through the available order status updates.</p>
                    <p>Delivery times shown by the platform are estimated and may change due to restaurant preparation or delivery conditions.</p>
                    <p>Customers should verify their order when it is delivered.</p>
                </div>
            );
        }

        if (role === "OWNER") {
            return (
                <div className="terms-section">
                    <h2>Restaurant Owner Terms & Conditions</h2>
                    <p>Restaurant owners can request to become QuickBite restaurant partners.</p>
                    <p>Restaurant information, food details, prices and availability should be kept accurate.</p>
                    <p>For this demo project, 65% of eligible order income is allocated to the restaurant owner.</p>
                    <p>The remaining 35% is allocated to the QuickBite administration side.</p>
                    <p>For every completed three-month period, an additional 10% income benefit is demonstrated for eligible restaurant owners.</p>
                    <p>Restaurants are responsible for preparing orders according to the information displayed to customers.</p>
                    <p>Owners should keep their restaurant opening and closing information updated.</p>
                    <p>QuickBite may review restaurant requests before approving them as partners.</p>
                </div>
            );
        }

        if (role === "DELIVERY_AGENT") {
            return (
                <div className="terms-section">
                    <h2>Delivery Partner Terms & Conditions</h2>
                    <p>Delivery partners can view available delivery requests through the Order Alert section.</p>
                    <p>A delivery partner can accept an available delivery request and become responsible for that delivery.</p>
                    <p>For this demo project, 85% of the delivery charge is allocated to the delivery partner.</p>
                    <p>The remaining 15% of the delivery charge is allocated to the QuickBite administration side.</p>
                    <p>Delivery partners should collect the order from the correct restaurant.</p>
                    <p>Delivery partners should verify the delivery information before handing the order to the customer.</p>
                    <p>After completing a delivery, the delivery partner becomes available for another delivery.</p>
                    <p>Delivery partners should maintain professional communication with restaurants and customers.</p>
                </div>
            );
        }

        return (
            <div className="terms-section">
                <h2>QuickBite Terms & Conditions</h2>
                <p>QuickBite is a demo food delivery platform created to demonstrate a microservices-based food delivery system.</p>
                <p>The platform connects customers, restaurants and delivery partners.</p>
                <p>Users can explore restaurants, browse food items and place orders.</p>
                <p>Restaurant owners can request partnership approval and manage their restaurants.</p>
                <p>Delivery partners can accept available delivery requests and complete deliveries.</p>
                <p>All income-sharing percentages shown on this page are demonstration values for this portfolio project.</p>
            </div>
        );
    };

    return (
        <div className="about-container">
            <div className="navbar">
                <h3 className="name">QuickBite</h3>
                <ul>
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

            <h1 className="about-title">About QuickBite</h1>

            <div className="company-section">
                <h2>Our Platform</h2>
                <p>QuickBite is a demo AI-powered food delivery platform designed to connect customers, restaurant owners and delivery partners.</p>
                <p>Our platform demonstrates restaurant discovery, food ordering, order tracking, delivery assignment and role-based services.</p>
                <p>QuickBite is designed using a scalable Spring Boot microservices architecture with separate services for users, restaurants, food, orders, delivery and notifications.</p>
            </div>

            <div className="benefits-section">
                <h2>QuickBite Highlights</h2>
                <p>Smart food discovery for customers.</p>
                <p>Simple restaurant partnership management.</p>
                <p>Order tracking from placement to delivery.</p>
                <p>Delivery requests are shown to available delivery partners.</p>
                <p>Role-based features for customers, owners, delivery partners and administrators.</p>
                <p>Designed with scalability and service-to-service communication in mind.</p>
                <p>Demonstrates real-world concepts such as order lifecycle management and delivery assignment.</p>
            </div>

            {renderTerms()}

            <div className="demo-notice">
                <h3>Demo Project Notice</h3>
                <p>All policies, income percentages, benefits and achievements displayed on this page are fictional values created for demonstration purposes in this portfolio project. They do not represent real QuickBite commercial policies.</p>
            </div>

            <div className="footer">
                <p>© 2026 QuickBite</p>
            </div>
        </div>
    );
}

export default About;