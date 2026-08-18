import React from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';

/**
 * Halaman Error 500 Internal Server Error
 * Ditampilkan saat terjadi kesalahan tak terduga pada server backend Laravel.
 */
export const Error500 = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900">
        <ServerCrash className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-sans">
        500 Internal Server Error
      </h1>
      <p className="text-sm font-semibold text-rose-500 mt-1">Kesalahan Server</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6">
        Terjadi masalah internal pada server backend. Tim pengembang STMIK Bandung sedang memperbaiki kendala ini.
      </p>
      <Button icon={RefreshCw} onClick={() => window.location.reload()}>
        Coba Muat Ulang Halaman
      </Button>
    </div>
  );
};
