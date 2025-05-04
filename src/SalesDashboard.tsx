"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";

interface Sale {
  id: string;
  userId: string;
  userName: string;
  saleTimestamp: Timestamp;
  totalAmount: number;
  createdAt: Timestamp;
  items?: SaleItem[];
}

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantitySold: number;
  priceAtSale: number;
}

interface ProductSummary {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

interface SellerSummary {
  userId: string;
  userName: string;
  totalSales: number;
  totalAmount: number;
}

interface DateFilter {
  period: "all" | "year" | "month" | "week" | "day";
  year: number;
  month: number;
  week: number;
  day: number;
}

const [dateFilter, setDateFilter] = useState<DateFilter>({
  period: "all",
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  week: 1,
  day: new Date().getDate(),
});

const [tempFilter, setTempFilter] = useState<DateFilter>(dateFilter);

const SalesDashboard = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    period: "all",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    week: 1,
    day: new Date().getDate(),
  });

  const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);
  const [sellerSummary, setSellerSummary] = useState<SellerSummary[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Cargar ventas según filtro
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        // Construir filtro de fecha
        let startDate: Date | null = null;
        let endDate: Date | null = null;

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
            startDate = new Date(
              dateFilter.year,
              dateFilter.month - 1,
              dateFilter.day
            );
            endDate = new Date(
              dateFilter.year,
              dateFilter.month - 1,
              dateFilter.day
            );
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
          constraints.push(
            where("saleTimestamp", ">=", Timestamp.fromDate(startDate)),
            where("saleTimestamp", "<=", Timestamp.fromDate(endDate))
          );
        }

        constraints.push(orderBy("saleTimestamp", "desc"));

        const q = query(salesQuery, ...constraints);
        const querySnapshot = await getDocs(q);

        const salesData: Sale[] = [];

        // Procesar resultados
        for (const doc of querySnapshot.docs) {
          const saleData = doc.data() as Omit<Sale, "id" | "items">;

          // Obtener items de la venta
          const itemsSnapshot = await getDocs(
            collection(db, `sales/${doc.id}/saleItems`)
          );
          const items: SaleItem[] = [];

          itemsSnapshot.forEach((itemDoc) => {
            items.push({
              id: itemDoc.id,
              ...itemDoc.data(),
            } as SaleItem);
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
      } catch (error) {
        console.error("Error al cargar ventas:", error);
        toast.error("Error al cargar ventas");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [dateFilter]);

  // Calcular resúmenes de ventas
  const calculateSummaries = (salesData: Sale[]) => {
    // Calcular ingresos totales
    const total = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    setTotalRevenue(total);

    // Calcular resumen por producto
    const productMap = new Map<string, ProductSummary>();

    salesData.forEach((sale) => {
      sale.items?.forEach((item) => {
        const existing = productMap.get(item.productId);

        if (existing) {
          existing.totalQuantity += item.quantitySold;
          existing.totalAmount += item.quantitySold * item.priceAtSale;
        } else {
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
    const sellerMap = new Map<string, SellerSummary>();

    salesData.forEach((sale) => {
      const existing = sellerMap.get(sale.userId);

      if (existing) {
        existing.totalSales += 1;
        existing.totalAmount += sale.totalAmount;
      } else {
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
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    setTempFilter((prev) => ({
      ...prev,
      [name]: name === "period" ? value : Number.parseInt(value),
    }));
  };
  

  // Formatear fecha
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="period" className="block text-gray-700 mb-1">
              Período
            </label>
            <select
              id="period"
              name="period"
              value={dateFilter.period}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todo</option>
              <option value="year">Año</option>
              <option value="month">Mes</option>
              <option value="week">Semana</option>
              <option value="day">Día</option>
            </select>
          </div>

          {dateFilter.period !== "all" && (
            <div>
              <label htmlFor="year" className="block text-gray-700 mb-1">
                Año
              </label>
              <select
                id="year"
                name="year"
                value={dateFilter.year}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {["month", "day"].includes(dateFilter.period) && (
            <div>
              <label htmlFor="month" className="block text-gray-700 mb-1">
                Mes
              </label>
              <select
                id="month"
                name="month"
                value={dateFilter.month}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
                      new Date(2000, month - 1, 1)
                    )}
                  </option>
                ))}
              </select>
            </div>
          )}

          {dateFilter.period === "week" && (
            <div>
              <label htmlFor="week" className="block text-gray-700 mb-1">
                Semana
              </label>
              <select
                id="week"
                name="week"
                value={dateFilter.week}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                  <option key={week} value={week}>
                    Semana {week}
                  </option>
                ))}
              </select>
            </div>
          )}

          {dateFilter.period === "day" && (
            <div>
              <label htmlFor="day" className="block text-gray-700 mb-1">
                Día
              </label>
              <select
                id="day"
                name="day"
                value={dateFilter.day}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from(
                  {
                    length: new Date(
                      dateFilter.year,
                      dateFilter.month,
                      0
                    ).getDate(),
                  },
                  (_, i) => i + 1
                ).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              
            </div>
          )}
            {/* Botón de búsqueda */}
            <div className="md:col-span-5 flex justify-end items-end mt-4">
        <button
          onClick={() => setDateFilter(tempFilter)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Caca
        </button>
      </div>
        </div>
      </div>

    

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total de Ventas</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {sales.length} ventas registradas
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Productos Más Vendidos</h3>
          {productSummary.length > 0 ? (
            <div className="space-y-2">
              {productSummary.slice(0, 3).map((product) => (
                <div key={product.productId} className="flex justify-between">
                  <span className="text-gray-800">{product.productName}</span>
                  <span className="font-medium">
                    {product.totalQuantity} unidades
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Vendedores Destacados</h3>
          {sellerSummary.length > 0 ? (
            <div className="space-y-2">
              {sellerSummary.slice(0, 3).map((seller) => (
                <div key={seller.userId} className="flex justify-between">
                  <span className="text-gray-800">{seller.userName}</span>
                  <span className="font-medium">
                    ${seller.totalAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Historial de Ventas</h2>

        {loading ? (
          <div className="text-center py-8">Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron ventas en el período seleccionado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(sale.saleTimestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.userName || sale.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {sale.items?.map((item) => (
                          <div key={item.id} className="mb-1">
                            {item.productName} x {item.quantitySold} ($
                            {item.priceAtSale.toFixed(2)} c/u)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${sale.totalAmount.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
