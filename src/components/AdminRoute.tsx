"use client";
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsAdminUser(isAdmin);
    } else {
      setIsAdminUser(false);
    }
    setAdminLoading(false);
  }, [currentUser, isAdmin]);

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  if (!currentUser || !isAdminUser) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminRoute;
