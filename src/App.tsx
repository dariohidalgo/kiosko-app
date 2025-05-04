import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Login from "./pages/Login"
import AdminLogin from "./pages/AdminLogin"
import SellerDashboard from "./pages/SellerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* Rutas protegidas para vendedores */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas para administradores */}
        <Route
          path="/admin/dashboard/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Ruta 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  )
}

export default App
