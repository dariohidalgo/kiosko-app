"use client";

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para navegación */}
      <Sidebar
        userRole="seller"
        onLogout={signOut}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white shadow-sm flex items-center px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 focus:outline-none md:hidden mr-4 flex-shrink-0"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Panel de Vendedor
            </h1>

            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                {currentUser?.email}
              </span>
              <button
                onClick={signOut}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Contenido de las rutas */}
        <main className="flex-1 overflow-y-auto p-4 ">
          <div className="max-w-full mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/app/venta" replace />} />
              <Route path="/venta" element={<RegisterSale />} />
              <Route path="/stock" element={<ManageStock />} />
              <Route path="/barcode" element={<BarcodeScanner />} />
              <Route path="*" element={<Navigate to="/app/venta" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
