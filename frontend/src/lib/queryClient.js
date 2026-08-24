import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance untuk TanStack React Query.
 * Dikonfigurasi agar cache langsung di-clear saat pergantian akun/login/logout
 * dan selalu mengambil data terbaru tanpa perlu hard refresh manual.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      retry: 1,
      staleTime: 0, // Segera anggap data butuh refetch agar tidak menampilkan data akun sebelumnya
    },
  },
});
