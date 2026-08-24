import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '../lib/queryClient';

/**
 * State Management Autentikasi (Zustand)
 * Berfungsi untuk mengontrol status sesi login pengguna, token Sanctum, data profil user (Admin, Dosen, Mahasiswa),
 * serta peran/role untuk proteksi rute (ProtectedRoute & RoleRoute) di frontend.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Menyimpan data sesi login pengguna dan token Bearer
      setAuth: (user, token) => {
        queryClient.clear(); // Bersihkan semua cache query akun sebelumnya
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      // Memperbarui data profil user aktif di store
      setUser: (user) => {
        set({ user });
      },

      // Menghapus data sesi saat pengguna logout
      logout: () => {
        queryClient.clear(); // Bersihkan semua cache query akun saat logout
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('stmik_auth_storage');
      },

      // Helper function untuk memeriksa apakah user memiliki role tertentu (misal: 'Admin', 'Dosen', 'Mahasiswa')
      hasRole: (roleName) => {
        const user = get().user;
        if (!user || !user.roles) return false;
        return user.roles.includes(roleName);
      },
    }),
    {
      name: 'stmik_auth_storage', // Key penyimpanan sesi di localStorage
    }
  )
);
