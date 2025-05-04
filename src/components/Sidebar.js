"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
// Función para detectar dispositivos móviles
const isMobileDevice = () => window.innerWidth < 768;
const Sidebar = ({ userRole, onLogout, isOpen = false, toggleSidebar, className = '' }) => {
    const location = useLocation();
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        // Verificar al inicio
        checkMobile();
        // Agregar listener de resize
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const handleToggleSidebar = () => {
        if (toggleSidebar) {
            toggleSidebar();
        }
        else {
            setLocalIsOpen(!localIsOpen);
        }
    };
    // Sincronizar estado si cambia el prop isOpen
    useEffect(() => {
        setLocalIsOpen(isOpen);
    }, [isOpen]);
    // Definir enlaces según el rol del usuario
    const links = userRole === "admin"
        ? [
            { to: "/admin/dashboard/ventas", label: "Dashboard de Ventas", icon: "chart-bar" },
            { to: "/admin/dashboard/inventario", label: "Gestión de Inventario", icon: "cube" },
            { to: "/admin/dashboard/usuarios", label: "Gestión de Usuarios", icon: "users" },
        ]
        : [
            { to: "/app/venta", label: "Registrar Venta", icon: "shopping-cart" },
            { to: "/app/stock", label: "Cargar Stock", icon: "archive" },
            { to: "/app/barcode", label: "Lector de Código", icon: "barcode" },
        ];
    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        onLogout();
    };
    // Función para renderizar el ícono según su nombre
    const renderIcon = (iconName) => {
        switch (iconName) {
            case "chart-bar":
                return (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }));
            case "cube":
                return (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" }) }));
            case "users":
                return (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }) }));
            case "shopping-cart":
                return (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" }) }));
            case "archive":
                return (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" }) }));
            case "barcode":
                return (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" }) }));
            default:
                return null;
        }
    };
    return (_jsxs(_Fragment, { children: [localIsOpen && isMobile && (_jsx("div", { onClick: handleToggleSidebar, className: "fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" })), _jsx("aside", { className: `
        fixed 
        inset-y-0 
        left-0 
        z-50 
        bg-white 
        shadow-lg 
        w-64 
        transition-transform 
        duration-300 
        ease-in-out 
        ${isMobile && !localIsOpen ? '-translate-x-full' : 'translate-x-0'}
        max-w-[80%]
        ${isMobile ? 'absolute' : 'relative'}
        ${className}
      `, children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "flex items-center justify-center h-16 bg-gray-800 text-white", children: _jsx("span", { className: "text-xl font-semibold text-white", children: userRole === "admin" ? "Admin Kiosko" : "Kiosko App" }) }), _jsx("nav", { className: "flex-1 px-2 py-4 bg-white space-y-1 overflow-y-auto", children: links.map((link) => (_jsxs(Link, { to: link.to, className: `
                  flex 
                  items-center 
                  px-4 
                  py-2 
                  text-sm 
                  font-medium 
                  rounded-md 
                  ${location.pathname === link.to ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}
                `, children: [_jsx("span", { className: "mr-3", children: renderIcon(link.icon) }), link.label] }, link.to))) }), _jsx("div", { className: "p-4 border-t border-gray-200", children: _jsx("button", { onClick: handleLogout, className: "w-full py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md", children: "Cerrar Sesi\u00F3n" }) })] }) })] }));
};
export default Sidebar;
