import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Komponen Reusable Empty State
 * Menampilkan pesan informatif saat tidak ada data perwalian/mahasiswa/dosen ditemukan.
 */
export const EmptyState = ({
  title = 'Tidak Ada Data Ditemukan',
  description = 'Belum ada data perwalian atau hasil pencarian yang cocok.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 my-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
        <Inbox className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
