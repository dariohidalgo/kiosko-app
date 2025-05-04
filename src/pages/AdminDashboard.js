"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import UserManagement from "@/components/admin/UserManagement";
import InventoryManagement from "@/components/admin/InventoryManagement";
import SalesDashboard from "@/components/admin/SalesDashboard";
const AdminDashboard = () => {
    const { currentUser, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-100 max-w-full md:max-w-full max-h-full mx-auto", children: [_jsx(Sidebar, { isOpen: sidebarOpen, toggleSidebar: toggleSidebar, userRole: "admin", onLogout: signOut }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("header", { className: "bg-white shadow-sm z-10 flex items-center px-4 py-3", children: [_jsx("button", { onClick: toggleSidebar, className: "text-gray-500 focus:outline-none md:hidden mr-4 flex-shrink-0", children: _jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }), _jsxs("div", { className: "flex-1 flex justify-between items-center", children: [_jsx("h1", { className: "text-xl font-semibold text-gray-800", children: "Panel de Administraci\u00F3n" }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-sm text-gray-600 mr-4", children: currentUser?.email }), _jsx("button", { onClick: signOut, className: "text-sm text-red-500 hover:text-red-700", children: "Cerrar Sesi\u00F3n" })] })] })] }), _jsx("main", { className: "flex-1 overflow-y-auto p-4", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/admin/dashboard/ventas", replace: true }) }), _jsx(Route, { path: "/usuarios", element: _jsx(UserManagement, {}) }), _jsx(Route, { path: "/inventario", element: _jsx(InventoryManagement, {}) }), _jsx(Route, { path: "/ventas", element: _jsx(SalesDashboard, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/admin/dashboard/ventas", replace: true }) })] }) })] })] }));
};
export default AdminDashboard;
