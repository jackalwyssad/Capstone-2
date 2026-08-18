import React from 'react';
import { Card } from '../common/Card';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

/**
 * Komponen Dashboard ActivityTimeline
 * Menampilkan linimasa histori aktivitas perwalian dan jejak audit (Recent Activity).
 */
export const ActivityTimeline = ({ activities = [] }) => {
  const getIcon = (action) => {
    if (action.includes('Disetujui')) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (action.includes('Ditolak')) return <XCircle className="w-4 h-4 text-rose-500" />;
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  return (
    <Card hover={false}>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 font-sans">
        <Clock className="w-4 h-4 text-primary-600" />
        Aktivitas Perwalian Terkini
      </h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Belum ada aktivitas terkini.</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-850 last:border-0 last:pb-0">
              <div className="mt-0.5">{getIcon(act.action)}</div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {act.user}
                  </p>
                  <span className="text-[10px] text-slate-400">{act.time}</span>
                </div>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                  {act.action}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {act.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
