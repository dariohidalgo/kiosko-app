"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp, } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";

const SalesDashboard = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState({
        period: "all",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        week: 1,
        day: new Date().getDate(),
    });
    const [tempFilter, setTempFilter] = useState(dateFilter);
    const [productSummary, setProductSummary] = useState([]);
    const [sellerSummary, setSellerSummary] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    // Cargar ventas según filtro
    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                // Construir filtro de fecha
                let startDate = null;
                let endDate = null;
                switch (dateFilter.period) {
                    case "year":
                        startDate = new Date(dateFilter.year, 0, 1);
                        endDate = new Date(dateFilter.year + 1, 0, 0);
                        break;
                    case "month":
                        startDate = new Date(dateFilter.year, dateFilter.month - 1, 1);
                        endDate = new Date(dateFilter.year, dateFilter.month, 0);
                        break;
                    case "week":
                        // Calcular fecha de inicio de la semana (domingo)
                        const firstDayOfYear = new Date(dateFilter.year, 0, 1);
                        const daysOffset = (dateFilter.week - 1) * 7;
                        startDate = new Date(firstDayOfYear);
                        startDate.setDate(firstDayOfYear.getDate() + daysOffset);
                        endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + 6);
                        break;
                    case "day":
                        startDate = new Date(dateFilter.year, dateFilter.month - 1, dateFilter.day);
                        endDate = new Date(dateFilter.year, dateFilter.month - 1, dateFilter.day);
                        endDate.setHours(23, 59, 59, 999);
                        break;
                    case "all":
                    default:
                        // No aplicar filtro de fecha
                        break;
                }
                // Construir consulta
                const salesQuery = collection(db, "sales");
                const constraints = [];
                if (startDate && endDate) {
                    constraints.push(where("saleTimestamp", ">=", Timestamp.fromDate(startDate)), where("saleTimestamp", "<=", Timestamp.fromDate(endDate)));
                }
                constraints.push(orderBy("saleTimestamp", "desc"));
                const q = query(salesQuery, ...constraints);
                const querySnapshot = await getDocs(q);
                const salesData = [];
                // Procesar resultados
                for (const doc of querySnapshot.docs) {
                    const saleData = doc.data();
                    // Obtener items de la venta
                    const itemsSnapshot = await getDocs(collection(db, `sales/${doc.id}/saleItems`));
                    const items = [];
                    itemsSnapshot.forEach((itemDoc) => {
                        items.push({
                            id: itemDoc.id,
                            ...itemDoc.data(),
                        });
                    });
                    salesData.push({
                        id: doc.id,
                        ...saleData,
                        items,
                    });
                }
                setSales(salesData);
                // Calcular resúmenes
                calculateSummaries(salesData);
            }
            catch (error) {
                console.error("Error al cargar ventas:", error);
                toast.error("Error al cargar ventas");
            }
            finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [dateFilter]);
    // Calcular resúmenes de ventas
    const calculateSummaries = (salesData) => {
        // Calcular ingresos totales
        const total = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
        setTotalRevenue(total);
        // Calcular resumen por producto
        const productMap = new Map();
        salesData.forEach((sale) => {
            sale.items?.forEach((item) => {
                const existing = productMap.get(item.productId);
                if (existing) {
                    existing.totalQuantity += item.quantitySold;
                    existing.totalAmount += item.quantitySold * item.priceAtSale;
                }
                else {
                    productMap.set(item.productId, {
                        productId: item.productId,
                        productName: item.productName,
                        totalQuantity: item.quantitySold,
                        totalAmount: item.quantitySold * item.priceAtSale,
                    });
                }
            });
        });
        const productSummaryList = Array.from(productMap.values());
        productSummaryList.sort((a, b) => b.totalAmount - a.totalAmount);
        setProductSummary(productSummaryList);
        // Calcular resumen por vendedor
        const sellerMap = new Map();
        salesData.forEach((sale) => {
            const existing = sellerMap.get(sale.userId);
            if (existing) {
                existing.totalSales += 1;
                existing.totalAmount += sale.totalAmount;
            }
            else {
                sellerMap.set(sale.userId, {
                    userId: sale.userId,
                    userName: sale.userName || sale.userId,
                    totalSales: 1,
                    totalAmount: sale.totalAmount,
                });
            }
        });
        const sellerSummaryList = Array.from(sellerMap.values());
        sellerSummaryList.sort((a, b) => b.totalAmount - a.totalAmount);
        setSellerSummary(sellerSummaryList);
    };
    // Manejar cambio en filtro de fecha
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setTempFilter((prev) => ({
            ...prev,
            [name]: name === "period" ? value : Number.parseInt(value),
        }));
    };
    // Formatear fecha
    const formatDate = (timestamp) => {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Filtros" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "period", className: "block text-gray-700 mb-1", children: "Per\u00EDodo" }), _jsxs("select", { id: "period", name: "period", value: dateFilter.period, onChange: handleFilterChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "all", children: "Todo" }), _jsx("option", { value: "year", children: "A\u00F1o" }), _jsx("option", { value: "month", children: "Mes" }), _jsx("option", { value: "week", children: "Semana" }), _jsx("option", { value: "day", children: "D\u00EDa" })] })] }), dateFilter.period !== "all" && (_jsxs("div", { children: [_jsx("label", { htmlFor: "year", className: "block text-gray-700 mb-1", children: "A\u00F1o" }), _jsx("select", { id: "year", name: "year", value: dateFilter.year, onChange: handleFilterChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (_jsx("option", { value: year, children: year }, year))) })] })), ["month", "day"].includes(dateFilter.period) && (_jsxs("div", { children: [_jsx("label", { htmlFor: "month", className: "block text-gray-700 mb-1", children: "Mes" }), _jsx("select", { id: "month", name: "month", value: dateFilter.month, onChange: handleFilterChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (_jsx("option", { value: month, children: new Intl.DateTimeFormat("es-ES", { month: "long" }).format(new Date(2000, month - 1, 1)) }, month))) })] })), dateFilter.period === "week" && (_jsxs("div", { children: [_jsx("label", { htmlFor: "week", className: "block text-gray-700 mb-1", children: "Semana" }), _jsx("select", { id: "week", name: "week", value: dateFilter.week, onChange: handleFilterChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (_jsxs("option", { value: week, children: ["Semana ", week] }, week))) })] })), dateFilter.period === "day" && (_jsxs("div", { children: [_jsx("label", { htmlFor: "day", className: "block text-gray-700 mb-1", children: "D\u00EDa" }), _jsx("select", { id: "day", name: "day", value: dateFilter.day, onChange: handleFilterChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: Array.from({
                                            length: new Date(dateFilter.year, dateFilter.month, 0).getDate(),
                                        }, (_, i) => i + 1).map((day) => (_jsx("option", { value: day, children: day }, day))) })] })), _jsx("div", { className: "md:col-span-5 flex justify-end items-end mt-4", children: _jsx("button", { onClick: () => setDateFilter(tempFilter), className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition", children: "Buscar" }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Total de Ventas" }), _jsxs("p", { className: "text-3xl font-bold text-purple-600", children: ["$", totalRevenue.toFixed(2)] }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [sales.length, " ventas registradas"] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Productos M\u00E1s Vendidos" }), productSummary.length > 0 ? (_jsx("div", { className: "space-y-2", children: productSummary.slice(0, 3).map((product) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-800", children: product.productName }), _jsxs("span", { className: "font-medium", children: [product.totalQuantity, " unidades"] })] }, product.productId))) })) : (_jsx("p", { className: "text-gray-500", children: "No hay datos disponibles" }))] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Vendedores Destacados" }), sellerSummary.length > 0 ? (_jsx("div", { className: "space-y-2", children: sellerSummary.slice(0, 3).map((seller) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-800", children: seller.userName }), _jsxs("span", { className: "font-medium", children: ["$", seller.totalAmount.toFixed(2)] })] }, seller.userId))) })) : (_jsx("p", { className: "text-gray-500", children: "No hay datos disponibles" }))] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Historial de Ventas" }), loading ? (_jsx("div", { className: "text-center py-8", children: "Cargando ventas..." })) : sales.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No se encontraron ventas en el per\u00EDodo seleccionado" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Fecha" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Vendedor" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Productos" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Total" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: sales.map((sale) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: formatDate(sale.saleTimestamp) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: sale.userName || sale.userId }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm text-gray-900", children: sale.items?.map((item) => (_jsxs("div", { className: "mb-1", children: [item.productName, " x ", item.quantitySold, " ($", item.priceAtSale.toFixed(2), " c/u)"] }, item.id))) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["$", sale.totalAmount.toFixed(2)] }) })] }, sale.id))) })] }) }))] })] }));
};
export default SalesDashboard;
