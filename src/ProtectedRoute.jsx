import React from "react";
import { Navigate } from "react-router-dom";

// Where each role lands when they're blocked from a page, or land after login
const ROLE_HOME = {
    USER: "/dashboard",
    OWNER: "/orderPage",
    DELIVERY_BOY: "/orderAlert",
    ADMIN: "/approval",
};

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

// Wrap any route that requires login. Pass allowedRoles to also restrict by role.
function ProtectedRoute({ children, allowedRoles }) {
    const user = getUser();

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role?.toUpperCase();

    // Logged in, but this route is restricted to other roles
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        const fallback = ROLE_HOME[userRole] || "/profile";
        return <Navigate to={fallback} replace />;
    }

    return children;
}

// Wrap routes that should ONLY be visible to logged-out users (login, signup, forgot)
export function PublicOnlyRoute({ children }) {
    const user = getUser();

    if (user) {
        const userRole = user.role?.toUpperCase();
        return <Navigate to={ROLE_HOME[userRole] || "/profile"} replace />;
    }

    return children;
}

export default ProtectedRoute;