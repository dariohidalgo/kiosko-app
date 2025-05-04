"use client";

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import UserManagement from "@/components/admin/UserManagement";
import InventoryManagement from "@/components/admin/InventoryManagement";
import SalesDashboard from "@/components/admin/SalesDashboard";

const AdminDashboard = () => {
  const { currentUser, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 max-w-full md:max-w-full max-h-full mx-auto">
      {/* Sidebar para navegación */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        userRole="admin"
        onLogout={signOut}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 flex items-center px-4 py-3">
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
              Panel de Administración
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
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard/ventas" replace />}
            />
            <Route path="/usuarios" element={<UserManagement />} />
            <Route path="/inventario" element={<InventoryManagement />} />
            <Route path="/ventas" element={<SalesDashboard />} />
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard/ventas" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
