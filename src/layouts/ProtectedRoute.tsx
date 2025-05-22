import React from "react";
import Loader from "@/components/Loader";
import { useAuthContext } from "@/contexts/auth-context";
import { Navigate, useLocation } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuthContext();
  const { pathname } = useLocation();
  if (isLoading) {
    return <Loader />;
  }
  if (!session) {
    return <Navigate to="/signin" state={{ redirectTo: pathname }} />;
  }
  return <>{children}</>;
}
