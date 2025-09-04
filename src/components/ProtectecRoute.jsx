// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isAdmin } = useAdmin();
  const location = useLocation();
  if (!isAdmin) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }
  return children;
}
