import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const NotFound = () => {
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gray-100", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-6xl font-bold text-gray-800 mb-4", children: "404" }), _jsx("h2", { className: "text-2xl font-semibold text-gray-700 mb-6", children: "P\u00E1gina no encontrada" }), _jsx("p", { className: "text-gray-600 mb-8", children: "La p\u00E1gina que est\u00E1s buscando no existe o ha sido movida." }), _jsx(Link, { to: "/", className: "px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200", children: "Volver al inicio" })] }) }));
};
export default NotFound;
