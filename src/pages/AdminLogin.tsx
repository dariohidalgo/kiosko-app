"use client";

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAdmin, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor ingrese email y contraseña");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);

      // Verificar si el usuario tiene permisos de administrador
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        toast.error("No tienes permisos de administrador");
        // Cerrar sesión si no es admin
        await signOut();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Kiosko App - Acceso Administradores
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@ejemplo.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-200 disabled:bg-purple-400"
          >
            {loading
              ? "Iniciando sesión..."
              : "Iniciar Sesión como Administrador"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/" className="text-purple-600 hover:underline">
            Acceso para Vendedores
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
