"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";
const BarcodeScanner = () => {
    const [barcode, setBarcode] = useState("");
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    // Enfocar el input al cargar el componente
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);
    // Buscar producto por código de barras
    const searchProductByBarcode = async (code) => {
        if (!code)
            return;
        setLoading(true);
        try {
            const q = query(collection(db, "products"), where("barcode", "==", code));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setProduct(null);
                toast.error(`No se encontró producto con código: ${code}`);
            }
            else {
                const doc = querySnapshot.docs[0];
                setProduct({
                    id: doc.id,
                    ...doc.data(),
                });
                toast.success(`Producto encontrado: ${doc.data().name}`);
            }
        }
        catch (error) {
            console.error("Error al buscar producto:", error);
            toast.error("Error al buscar producto");
        }
        finally {
            setLoading(false);
            setBarcode("");
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };
    // Manejar cambio en el input
    const handleChange = (e) => {
        setBarcode(e.target.value);
    };
    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        searchProductByBarcode(barcode);
    };
    // Manejar tecla Enter (para lectores de código de barras)
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchProductByBarcode(barcode);
        }
    };
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Lector de C\u00F3digo de Barras" }), _jsxs("form", { onSubmit: handleSubmit, className: "mb-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "barcode", className: "block text-gray-700 mb-2", children: "C\u00F3digo de Barras" }), _jsx("input", { ref: inputRef, id: "barcode", type: "text", value: barcode, onChange: handleChange, onKeyDown: handleKeyDown, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Escanee o ingrese el c\u00F3digo de barras", autoComplete: "off" })] }), _jsx("button", { type: "submit", disabled: loading || !barcode, className: "w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300", children: loading ? "Buscando..." : "Buscar Producto" })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { className: "mb-2", children: "Instrucciones:" }), _jsxs("ul", { className: "list-disc pl-5 space-y-1", children: [_jsx("li", { children: "Conecte su lector de c\u00F3digo de barras al dispositivo" }), _jsx("li", { children: "Aseg\u00FArese de que el cursor est\u00E9 en el campo de entrada" }), _jsx("li", { children: "Escanee el c\u00F3digo de barras del producto" }), _jsx("li", { children: "El sistema buscar\u00E1 autom\u00E1ticamente el producto" })] })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Informaci\u00F3n del Producto" }), loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsxs("svg", { className: "animate-spin h-8 w-8 text-blue-500 mx-auto", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("p", { className: "mt-2 text-gray-600", children: "Buscando producto..." })] })) : product ? (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-lg", children: product.name }), _jsx("p", { className: "text-gray-600 mb-3", children: product.description }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-3", children: [_jsxs("div", { className: "bg-gray-100 p-3 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Precio" }), _jsxs("p", { className: "font-bold text-blue-600", children: ["$", product.price.toFixed(2)] })] }), _jsxs("div", { className: "bg-gray-100 p-3 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Stock" }), _jsx("p", { className: `font-bold ${product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`, children: product.stock_quantity })] })] }), _jsxs("div", { className: "bg-gray-100 p-3 rounded-lg mb-3", children: [_jsx("p", { className: "text-sm text-gray-600", children: "C\u00F3digo de Barras" }), _jsx("p", { className: "font-mono", children: product.barcode })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: () => setProduct(null), className: "px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300", children: "Limpiar" }) })] })) : (_jsx("div", { className: "text-center py-8 text-gray-500", children: "Escanee un c\u00F3digo de barras para ver la informaci\u00F3n del producto" }))] })] }));
};
export default BarcodeScanner;
