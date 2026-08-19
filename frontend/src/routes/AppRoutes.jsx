import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Pages
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { MahasiswaListPage } from '../pages/mahasiswa/MahasiswaListPage';
import { DosenListPage } from '../pages/dosen/DosenListPage';
import { MatakuliahListPage } from '../pages/matakuliah/MatakuliahListPage';
import { PerwalianListPage } from '../pages/perwalian/PerwalianListPage';
import { RiwayatPage } from '../pages/riwayat/RiwayatPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { UserManagementPage } from '../pages/settings/UserManagementPage';

// Error Pages
import { Error403 } from '../pages/errors/Error403';
import { Error404 } from '../pages/errors/Error404';
import { Error500 } from '../pages/errors/Error500';

/**
 * Komponen Utama Peta Rute Aplikasi React Router DOM v6
 * Mengatur seluruh hierarki rute publik, rute terproteksi login, dan rute spesifik role.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect Root ke Login / Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Rute Autentikasi Publik */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Rute Terproteksi Login */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Rute Umum (Admin, Dosen Wali, Mahasiswa) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perwalian" element={<PerwalianListPage />} />
          <Route path="/riwayat" element={<RiwayatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Rute Khusus Mahasiswa & Admin (Dosen Dilarang Akses / 403) */}
          <Route element={<RoleRoute allowedRoles={['Admin', 'Mahasiswa']} />}>
            <Route path="/matakuliah" element={<MatakuliahListPage />} />
          </Route>

          {/* Rute Khusus Dosen Wali & Admin (Mahasiswa Dilarang Akses) */}
          <Route element={<RoleRoute allowedRoles={['Admin', 'Dosen']} />}>
            <Route path="/mahasiswa" element={<MahasiswaListPage />} />
          </Route>

          {/* Rute Khusus Super Admin */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/dosen" element={<DosenListPage />} />
            <Route path="/settings/users" element={<UserManagementPage />} />
          </Route>

          {/* Error Pages */}
          <Route path="/403" element={<Error403 />} />
          <Route path="/500" element={<Error500 />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
