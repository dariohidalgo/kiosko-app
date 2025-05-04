"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";
import toast from "react-hot-toast";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Por favor ingrese email y contraseña");
            return;
        }
        try {
            setLoading(true);
            await login(email, password);
            // Si el usuario es admin, redirigir al panel de admin
            if (isAdmin) {
                navigate("/admin/dashboard");
            }
            else {
                navigate("/app");
            }
        }
        catch (error) {
            console.error(error);
            toast.error(error.message || "Error al iniciar sesión");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100", children: _jsxs("div", { className: "max-w-md w-full p-6 bg-white rounded-lg shadow-md", children: [_jsx("h1", { className: "text-2xl font-bold text-center mb-6", children: "Kiosko App - Acceso Vendedores" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "email", className: "block text-gray-700 mb-2", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "ejemplo@correo.com", required: true })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { htmlFor: "password", className: "block text-gray-700 mb-2", children: "Contrase\u00F1a" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "********", required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300", children: loading ? "Iniciando sesión..." : "Iniciar Sesión" })] }), _jsx("div", { className: "mt-4 text-center", children: _jsx("a", { href: "/admin", className: "text-blue-500 hover:underline", children: "Acceso para Administradores" }) })] }) }));
};
export default Login;
