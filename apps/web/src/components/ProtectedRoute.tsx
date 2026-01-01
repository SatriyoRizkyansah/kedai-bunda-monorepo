import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "super_admin" | "admin" | "kasir" | ("super_admin" | "admin" | "kasir")[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    try {
      const userData = JSON.parse(user || "{}");
      const userRole = userData.role as "super_admin" | "admin" | "kasir";

      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!allowedRoles.includes(userRole)) {
        // User doesn't have required role, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
