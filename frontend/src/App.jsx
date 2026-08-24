import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Toaster } from 'sonner';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';

/**
 * Komponen Entry Root App
 * Membungkus aplikasi dengan TanStack QueryProvider, ErrorBoundary, BrowserRouter, Toaster Sonner, dan tema Dark Mode.
 */
export function App() {
  const initTheme = useThemeStore((state) => state.initTheme);
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    initTheme();
    // Sinkronisasi data user terbaru & foto profil dari database saat refresh
    if (token) {
      authService
        .me()
        .then((res) => {
          if (res?.data) {
            setUser(res.data);
          }
        })
        .catch(() => {});
    }
  }, [initTheme, token, setUser]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
