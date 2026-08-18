import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

/**
 * Halaman Error 403 Forbidden Access
 * Ditampilkan saat pengguna mencoba mengakses fitur yang memerlukan hak akses role yang lebih tinggi (misal: Mahasiswa membuka menu Admin).
 */
export const Error403 = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-sans">
        403 Forbidden
      </h1>
      <p className="text-sm font-semibold text-rose-500 mt-1">Akses Ditolak / Tidak Memiliki Izin</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6">
        Maaf, akun Anda tidak memiliki hak akses role (permission) untuk membuka halaman ini. Silakan hubungi Administrator STMIK Bandung.
      </p>
      <Link to="/dashboard">
        <Button icon={ArrowLeft}>Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
};
