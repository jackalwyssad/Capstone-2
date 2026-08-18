import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Route Guard Component: RoleRoute
 * Memvalidasi apakah role user login diizinkan mengakses halaman spesifik (misal Admin only).
 * Jika role tidak cocok, redirect otomatis ke halaman Error 403 Forbidden.
 */
export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuthStore();
  const userRole = user?.roles?.[0];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
