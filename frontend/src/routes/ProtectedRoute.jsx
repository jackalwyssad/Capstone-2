import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Route Guard Component: ProtectedRoute
 * Memastikan hanya pengguna yang sudah terautentikasi (memiliki token valid) yang dapat mengakses rute di dalamnya.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
