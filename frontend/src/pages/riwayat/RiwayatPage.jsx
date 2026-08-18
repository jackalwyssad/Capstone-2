import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { perwalianService } from '../../services/perwalianService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { formatDateIndonesian } from '../../utils/formatters';
import { History, Clock, UserCheck } from 'lucide-react';

/**
 * Halaman Riwayat Audit Trail Perwalian
 * Menampilkan linimasa kronologis histori perwalian beserta log catatan perubahan status.
 */
export const RiwayatPage = () => {
  const { data: perwalianResponse, isLoading } = useQuery({
    queryKey: ['riwayat-perwalian'],
    queryFn: () => perwalianService.getPerwalian({ per_page: 50 }),
  });

  const list = perwalianResponse?.data || [];

  return (
    <div>
      <PageHeader
        title="Riwayat Bimbingan & Audit Trail"
        description="Jejak histori persetujuan, penolakan, dan catatan evaluasi perwalian semester."
      />

      <Card hover={false}>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : list.length === 0 ? (
          <p className="text-xs text-slate-400 p-8 text-center">Belum ada riwayat perwalian.</p>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
            {list.map((item) => (
              <div key={item.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-slate-950 shadow-md" />

                <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.mahasiswa?.nama_lengkap} ({item.mahasiswa?.nim})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Semester: <strong className="text-slate-800 dark:text-slate-200">{item.semester}</strong> — Dosen Wali: {item.dosen?.nama_lengkap}
                      </p>
                    </div>
                    <Badge status={item.status} />
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p><strong>Total SKS:</strong> {item.sks_diambil} SKS | <strong>IPK:</strong> {item.ipk_semester}</p>
                    {item.catatan_dosen && (
                      <p className="text-primary-600 dark:text-primary-400 italic">
                        "Catatan Dosen: {item.catatan_dosen}"
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Diproses pada: {formatDateIndonesian(item.tgl_persetujuan || item.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
