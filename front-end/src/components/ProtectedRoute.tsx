// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "../services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = getAuthToken();
  const location = useLocation();

  // Se não houver token → redireciona para login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Recupera dados do usuário do localStorage
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // Se a rota começar com /admin e o usuário não for admin → redireciona para dashboard
  if (location.pathname.startsWith("/admin") && (!user || !user.is_admin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Caso contrário → renderiza normalmente
  return <>{children}</>;
};

export default ProtectedRoute;
