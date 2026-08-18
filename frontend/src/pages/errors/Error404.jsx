import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

/**
 * Halaman Error 404 Not Found
 * Ditampilkan saat rute URL yang dimasukkan pengguna tidak ditemukan di sistem perwalian.
 */
export const Error404 = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-900">
        <FileQuestion className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-sans">
        404 Not Found
      </h1>
      <p className="text-sm font-semibold text-amber-500 mt-1">Halaman Tidak Ditemukan</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6">
        Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
      </p>
      <Link to="/dashboard">
        <Button icon={ArrowLeft}>Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
};
