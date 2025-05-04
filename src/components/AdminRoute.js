"use client";

import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";
const AdminRoute = ({ children }) => {
    const { currentUser, isAdmin, loading } = useAuth();
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const adminStatus = await isAdmin();
                setIsAdminUser(adminStatus);
            }
            catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdminUser(false);
            }
            finally {
                setAdminLoading(false);
            }
        };
        if (currentUser) {
            checkAdminStatus();
        }
        else {
            setAdminLoading(false);
        }
    }, [currentUser, isAdmin]);
    if (loading || adminLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: "Cargando..." }));
    }
    if (!currentUser || !isAdminUser) {
        return _jsx(Navigate, { to: "/admin", replace: true });
    }
    return children;
};
export default AdminRoute;
