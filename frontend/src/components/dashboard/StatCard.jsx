import React from 'react';
import { Card } from '../common/Card';

/**
 * Komponen Dashboard StatCard
 * Menampilkan kartu angka statistik (Total Mahasiswa, Dosen, Perwalian, Pending, Approved, Rejected)
 * dengan ikon Lucide dan gradien latar belakang modern.
 */
export const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  const colorGradients = {
    blue: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    emerald: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
    amber: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
    rose: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
    purple: 'from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50',
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${colorGradients[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-sans tracking-tight">
            {value}
          </h3>
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-md flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};
