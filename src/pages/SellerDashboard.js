"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import RegisterSale from "@/components/seller/RegisterSale";
import ManageStock from "@/components/seller/ManageStock";
import BarcodeScanner from "@/components/seller/BarcodeScanner";
const SellerDashboard = () => {
    const { currentUser, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-100", children: [_jsx(Sidebar, { userRole: "seller", onLogout: signOut, isOpen: sidebarOpen, toggleSidebar: toggleSidebar }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden w-full", children: [_jsxs("header", { className: "bg-white shadow-sm flex items-center px-4 py-3", children: [_jsx("button", { onClick: toggleSidebar, className: "text-gray-500 focus:outline-none md:hidden mr-4 flex-shrink-0", children: _jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }), _jsxs("div", { className: "flex-1 flex justify-between items-center", children: [_jsx("h1", { className: "text-xl font-semibold text-gray-800", children: "Panel de Vendedor" }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-sm text-gray-600 mr-4", children: currentUser?.email }), _jsx("button", { onClick: signOut, className: "text-sm text-red-500 hover:text-red-700", children: "Cerrar Sesi\u00F3n" })] })] })] }), _jsx("main", { className: "flex-1 overflow-y-auto p-4 ", children: _jsx("div", { className: "max-w-full mx-auto", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/app/venta", replace: true }) }), _jsx(Route, { path: "/venta", element: _jsx(RegisterSale, {}) }), _jsx(Route, { path: "/stock", element: _jsx(ManageStock, {}) }), _jsx(Route, { path: "/barcode", element: _jsx(BarcodeScanner, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/app/venta", replace: true }) })] }) }) })] })] }));
};
export default SellerDashboard;
