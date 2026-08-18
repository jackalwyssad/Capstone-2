import React from 'react';

/**
 * Komponen PageHeader
 * Menampilkan judul halaman, deskripsi modul, serta tombol aksi cepat (misal: Tambah, Export).
 */
export const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
};
