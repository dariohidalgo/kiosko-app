"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, increment, addDoc, serverTimestamp, } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
const ManageStock = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // Cargar productos al montar el componente
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    productsData.push({
                        id: doc.id,
                        ...data,
                    });
                });
                setProducts(productsData);
                setFilteredProducts(productsData);
            }
            catch (error) {
                console.error("Error al cargar productos:", error);
                toast.error("Error al cargar productos");
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    // Filtrar productos según término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredProducts(products);
        }
        else {
            const filtered = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (product.barcode && product.barcode.includes(searchTerm)));
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);
    // Seleccionar producto
    const selectProduct = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
    };
    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) {
            toast.error("Seleccione un producto");
            return;
        }
        if (quantity <= 0) {
            toast.error("La cantidad debe ser mayor a 0");
            return;
        }
        setSubmitting(true);
        try {
            // Actualizar stock del producto
            const productRef = doc(db, "products", selectedProduct.id);
            await updateDoc(productRef, {
                stock_quantity: increment(quantity),
            });
            // Registrar en el log de stock
            await addDoc(collection(db, "stock_log"), {
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                changeQuantity: quantity,
                reason: "entry",
                userId: currentUser?.uid,
                timestamp: serverTimestamp(),
            });
            toast.success(`Stock actualizado: ${selectedProduct.name} (+${quantity})`);
            // Actualizar la lista de productos
            const updatedProductDoc = await getDoc(productRef);
            if (updatedProductDoc.exists()) {
                const updatedProduct = {
                    id: updatedProductDoc.id,
                    ...updatedProductDoc.data(),
                };
                setProducts((prevProducts) => prevProducts.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
            }
            // Limpiar formulario
            setSelectedProduct(null);
            setQuantity(1);
        }
        catch (error) {
            console.error("Error al actualizar stock:", error);
            toast.error("Error al actualizar stock");
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Seleccionar Producto" }), _jsx("div", { className: "mb-4", children: _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Buscar producto por nombre, descripci\u00F3n o c\u00F3digo de barras", className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }) }), loading ? (_jsx("div", { className: "text-center py-4", children: "Cargando productos..." })) : filteredProducts.length === 0 ? (_jsx("div", { className: "text-center py-4", children: "No se encontraron productos" })) : (_jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: filteredProducts.map((product) => (_jsxs("div", { className: `border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${selectedProduct?.id === product.id
                                ? "border-blue-500 bg-blue-50"
                                : ""}`, onClick: () => selectProduct(product), children: [_jsx("h3", { className: "font-medium", children: product.name }), _jsx("p", { className: "text-sm text-gray-600 truncate", children: product.description }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsxs("span", { className: "font-bold text-blue-600", children: ["$", product.price.toFixed(2)] }), _jsxs("span", { className: "text-sm text-gray-500", children: ["Stock actual: ", product.stock_quantity] })] })] }, product.id))) }))] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Cargar Stock" }), selectedProduct ? (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "font-medium text-lg", children: selectedProduct.name }), _jsx("p", { className: "text-sm text-gray-600", children: selectedProduct.description }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Stock actual:", " ", _jsx("span", { className: "font-semibold", children: selectedProduct.stock_quantity })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "quantity", className: "block text-gray-700 mb-2", children: "Cantidad a agregar" }), _jsx("input", { id: "quantity", type: "number", min: "1", value: quantity, onChange: (e) => setQuantity(Number.parseInt(e.target.value) || 0), className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { type: "button", onClick: () => setSelectedProduct(null), className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: submitting, className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300", children: submitting ? "Guardando..." : "Guardar Entrada" })] })] })) : (_jsx("div", { className: "text-center py-8 text-gray-500", children: "Seleccione un producto de la lista para cargar stock" }))] })] }));
};
export default ManageStock;
