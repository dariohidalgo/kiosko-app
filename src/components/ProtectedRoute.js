"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: "Cargando..." }));
    }
    if (!currentUser) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return children;
};
export default ProtectedRoute;
