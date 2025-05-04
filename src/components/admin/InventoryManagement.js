"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";
const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        stock_quantity: 0,
        barcode: "",
        isActive: true,
    });
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
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.barcode && product.barcode.includes(searchTerm)));
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);
    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
        }));
    };
    // Manejar cambio en checkbox
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };
    // Editar producto
    const editProduct = (product) => {
        setEditingProduct(product);
        setProductData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock_quantity: product.stock_quantity,
            barcode: product.barcode || "",
            isActive: product.isActive !== false, // Si no está definido, asumimos que está activo
        });
        setShowCreateForm(true);
    };
    // Cancelar edición/creación
    const cancelForm = () => {
        setShowCreateForm(false);
        setEditingProduct(null);
        setProductData({
            name: "",
            description: "",
            price: 0,
            stock_quantity: 0,
            barcode: "",
            isActive: true,
        });
    };
    // Guardar producto (crear o actualizar)
    const saveProduct = async (e) => {
        e.preventDefault();
        if (!productData.name) {
            toast.error("El nombre del producto es obligatorio");
            return;
        }
        setSubmitting(true);
        try {
            if (editingProduct) {
                // Actualizar producto existente
                await updateDoc(doc(db, "products", editingProduct.id), {
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    stock_quantity: productData.stock_quantity,
                    barcode: productData.barcode || null,
                    isActive: productData.isActive,
                    updatedAt: serverTimestamp(),
                });
                toast.success("Producto actualizado correctamente");
                // Actualizar lista de productos
                const updatedProductDoc = await getDoc(doc(db, "products", editingProduct.id));
                if (updatedProductDoc.exists()) {
                    const updatedProduct = {
                        id: updatedProductDoc.id,
                        ...updatedProductDoc.data(),
                    };
                    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
                }
            }
            else {
                // Crear nuevo producto
                const newProductRef = doc(collection(db, "products"));
                await setDoc(newProductRef, {
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    stock_quantity: productData.stock_quantity,
                    barcode: productData.barcode || null,
                    isActive: productData.isActive,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                toast.success("Producto creado correctamente");
                // Actualizar lista de productos
                const newProductDoc = await getDoc(newProductRef);
                if (newProductDoc.exists()) {
                    const newProduct = {
                        id: newProductDoc.id,
                        ...newProductDoc.data(),
                    };
                    setProducts((prev) => [...prev, newProduct]);
                }
            }
            // Limpiar formulario
            cancelForm();
        }
        catch (error) {
            console.error("Error al guardar producto:", error);
            toast.error("Error al guardar producto");
        }
        finally {
            setSubmitting(false);
        }
    };
    // Cambiar estado de producto (activo/inactivo)
    const toggleProductStatus = async (productId, currentStatus = true) => {
        try {
            await updateDoc(doc(db, "products", productId), {
                isActive: !currentStatus,
                updatedAt: serverTimestamp(),
            });
            // Actualizar lista de productos
            setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, isActive: !currentStatus } : p)));
            toast.success(`Producto ${!currentStatus ? "activado" : "desactivado"} correctamente`);
        }
        catch (error) {
            console.error("Error al actualizar estado del producto:", error);
            toast.error("Error al actualizar estado del producto");
        }
    };
    return (_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Gesti\u00F3n de Inventario" }), _jsx("button", { onClick: () => setShowCreateForm(!showCreateForm), className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700", children: showCreateForm ? "Cancelar" : "Crear Producto" })] }), showCreateForm && (_jsxs("div", { className: "mb-6 p-4 border rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: editingProduct ? "Editar Producto" : "Crear Nuevo Producto" }), _jsxs("form", { onSubmit: saveProduct, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-gray-700 mb-1", children: "Nombre *" }), _jsx("input", { id: "name", name: "name", type: "text", value: productData.name, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "price", className: "block text-gray-700 mb-1", children: "Precio *" }), _jsx("input", { id: "price", name: "price", type: "number", step: "0.01", min: "0", value: productData.price, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { htmlFor: "description", className: "block text-gray-700 mb-1", children: "Descripci\u00F3n" }), _jsx("textarea", { id: "description", name: "description", value: productData.description, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "stock_quantity", className: "block text-gray-700 mb-1", children: "Cantidad en Stock" }), _jsx("input", { id: "stock_quantity", name: "stock_quantity", type: "number", min: "0", value: productData.stock_quantity, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "barcode", className: "block text-gray-700 mb-1", children: "C\u00F3digo de Barras" }), _jsx("input", { id: "barcode", name: "barcode", type: "text", value: productData.barcode, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" })] }), _jsx("div", { className: "md:col-span-2", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "isActive", checked: productData.isActive, onChange: handleCheckboxChange, className: "h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-gray-700", children: "Producto Activo" })] }) })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { type: "button", onClick: cancelForm, className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: submitting, className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400", children: submitting ? "Guardando..." : "Guardar Producto" })] })] })] })), _jsx("div", { className: "mb-4", children: _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Buscar producto por nombre, descripci\u00F3n o c\u00F3digo de barras", className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" }) }), loading ? (_jsx("div", { className: "text-center py-8", children: "Cargando productos..." })) : filteredProducts.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No se encontraron productos" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nombre" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Precio" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Stock" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "C\u00F3digo" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Estado" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Acciones" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredProducts.map((product) => (_jsxs("tr", { className: !product.isActive ? "bg-gray-50" : "", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: product.name }), _jsx("div", { className: "text-sm text-gray-500 truncate max-w-xs", children: product.description })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm text-gray-900", children: ["$", product.price.toFixed(2)] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: product.stock_quantity }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: product.barcode || "-" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: product.isActive !== false ? "Activo" : "Inactivo" }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [_jsx("button", { onClick: () => editProduct(product), className: "text-indigo-600 hover:text-indigo-900 mr-3", children: "Editar" }), _jsx("button", { onClick: () => toggleProductStatus(product.id, product.isActive !== false), className: product.isActive !== false
                                                    ? "text-red-600 hover:text-red-900"
                                                    : "text-green-600 hover:text-green-900", children: product.isActive !== false ? "Desactivar" : "Activar" })] })] }, product.id))) })] }) }))] }));
};
export default InventoryManagement;
