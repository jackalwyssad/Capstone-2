import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * State Management Theme (Zustand)
 * Berfungsi untuk mengelola status Dark Mode / Light Mode di seluruh aplikasi React Frontend.
 * Menyimpan preferensi pengguna di localStorage secara otomatis.
 * Mengubah class 'dark' pada elemen HTML root <html> untuk menerapkan styling Tailwind dark mode.
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,

      // Fungsi toggle untuk beralih antara Dark Mode dan Light Mode
      toggleDarkMode: () => {
        const nextState = !get().isDarkMode;
        set({ isDarkMode: nextState });

        if (nextState) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Fungsi inisialisasi tema saat pertama kali aplikasi dimuat
      initTheme: () => {
        if (get().isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'stmik_theme_storage', // Key di localStorage
    }
  )
);
