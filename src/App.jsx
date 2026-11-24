import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import Update from "./pages/update";
import Dashboard from "./pages/dashboard";
import AddFood from "./pages/addFood";
import OrderAlert from "./pages/orderAlert";
import OrderPage from "./pages/orderPage";
import Cart from "./pages/cart";
import OfferPage from "./pages/offerPage";
import Income from "./pages/income";
import OrderHistory from "./pages/orderHistory";
import History from "./pages/history";
import DeliveryHistory from "./pages/deliveryHistory";
import Review from "./pages/review";
import ReviewModel from "./pages/ReviewModel";
import Approval from "./pages/approval";
import About from "./pages/about";
import Forgot from "./pages/forgot";
import Membership from "./pages/membership";
import Home from "./pages/home";
import FoodDetails from "./pages/foodDetails";
import Payment from "./pages/payment";
import Notification from "./pages/notification";

function App() {
    return (
        <HashRouter>
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/update" element={<Update />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/food/:id" element={<FoodDetails />} />
                <Route path="/addFood" element={<AddFood />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orderPage" element={<OrderPage />} />
                <Route path="/orderAlert" element={<OrderAlert />} />
                <Route path="/offerPage" element={<OfferPage />} />
                <Route path="/income" element={<Income />} />
                <Route path="/orderHistory" element={<OrderHistory />} />
                <Route path="/history" element={<History />} />
                <Route path="/deliveryHistory" element={<DeliveryHistory />} />
                <Route path="/review" element={<Review />} />
                <Route path="/ReviewModel" element={<ReviewModel />} />
                <Route path="/approval" element={<Approval />} />
                <Route path="/about" element={<About />} />
                <Route path="/forgot" element={<Forgot />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/notification" element={<Notification />} />
            </Routes>
        </HashRouter>
    );
}

export default App;