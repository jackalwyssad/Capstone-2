import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { perwalianService } from '../../services/perwalianService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { formatDateIndonesian } from '../../utils/formatters';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

// Map jadwal rujukan
const JADWAL_MAP = {
  'IF-101': { hari: 'Senin',  mulai: '07:30', selesai: '11:00', ruang: 'Lab IF-1' },
  'IF-102': { hari: 'Senin',  mulai: '11:10', selesai: '13:40', ruang: 'Lab DB-1' },
  'IF-103': { hari: 'Selasa', mulai: '07:30', selesai: '10:00', ruang: 'Lab IF-2' },
  'IF-104': { hari: 'Selasa', mulai: '10:30', selesai: '13:00', ruang: 'Ruang 301' },
  'IF-105': { hari: 'Rabu',   mulai: '07:30', selesai: '10:00', ruang: 'Lab AI-1' },
  'IF-106': { hari: 'Rabu',   mulai: '10:30', selesai: '13:00', ruang: 'Lab Net-1' },
  'IF-107': { hari: 'Kamis',  mulai: '07:30', selesai: '10:00', ruang: 'Lab Mobile-1' },
  'IF-108': { hari: 'Kamis',  mulai: '10:30', selesai: '13:00', ruang: 'Lab Sec-1' },
  'IF-109': { hari: 'Jumat',  mulai: '07:30', selesai: '09:10', ruang: 'Ruang 401' },
  'IF-110': { hari: 'Jumat',  mulai: '09:30', selesai: '14:30', ruang: 'Bimbingan' },
  'SI-201': { hari: 'Senin',  mulai: '14:00', selesai: '16:30', ruang: 'Ruang 201' },
  'SI-202': { hari: 'Selasa', mulai: '14:00', selesai: '16:30', ruang: 'Ruang 202' },
  'SI-203': { hari: 'Rabu',   mulai: '14:00', selesai: '16:30', ruang: 'Ruang 203' },
  'SI-204': { hari: 'Kamis',  mulai: '14:00', selesai: '16:30', ruang: 'Ruang 301' },
  'SI-205': { hari: 'Jumat',  mulai: '14:40', selesai: '17:10', ruang: 'Ruang 302' },
  'MK-301': { hari: 'Sabtu',  mulai: '07:30', selesai: '10:00', ruang: 'Aula A' },
  'MK-302': { hari: 'Sabtu',  mulai: '10:10', selesai: '12:40', ruang: 'Aula A' },
  'MK-303': { hari: 'Sabtu',  mulai: '13:00', selesai: '15:30', ruang: 'Aula B' },
  'MK-304': { hari: 'Senin',  mulai: '16:40', selesai: '18:20', ruang: 'R. Bahasa 1' },
  'MK-305': { hari: 'Selasa', mulai: '16:40', selesai: '18:20', ruang: 'Aula C' },
  'MK-306': { hari: 'Rabu',   mulai: '16:40', selesai: '18:20', ruang: 'Ruang 101' },
  'MK-307': { hari: 'Kamis',  mulai: '16:40', selesai: '18:20', ruang: 'Koordinator KP' },
};

/**
 * Halaman Riwayat Audit Trail Perwalian
 * Menampilkan linimasa kronologis histori perwalian beserta log catatan perubahan status
 * dan rincian Jadwal Kuliah resmi yang disetujui.
 */
export const RiwayatPage = () => {
  const [expandedId, setExpandedId] = useState(null);

  const { data: perwalianResponse, isLoading } = useQuery({
    queryKey: ['riwayat-perwalian'],
    queryFn: () => perwalianService.getPerwalian({ per_page: 50 }),
  });

  const list = perwalianResponse?.data || [];

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      <PageHeader
        title="Riwayat Bimbingan & Audit Trail"
        description="Jejak histori persetujuan, penolakan, dan rincian jadwal kuliah perwalian semester."
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
            {list.map((item) => {
              const isExpanded = expandedId === item.id;
              const hasMatkul = item.matakuliah_rencana && item.matakuliah_rencana.length > 0;

              return (
                <div key={item.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-slate-950 shadow-md" />

                  <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all">
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
                      <div className="flex items-center justify-between">
                        <p>
                          <strong>Total SKS:</strong> {item.sks_diambil} SKS | <strong>IPK:</strong> {item.ipk_semester}
                        </p>
                        {hasMatkul && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{isExpanded ? 'Sembunyikan Jadwal' : 'Lihat Jadwal Kuliah'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {item.catatan_dosen && (
                        <p className="text-primary-600 dark:text-primary-400 italic mt-1">
                          "Catatan Dosen: {item.catatan_dosen}"
                        </p>
                      )}

                      {/* Tabel Jadwal Kuliah saat di-expand */}
                      {isExpanded && hasMatkul && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                            Jadwal Kuliah Yang Diambil ({item.sks_diambil} SKS):
                          </p>
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">
                                <tr>
                                  <th className="p-2">Kode & Matkul</th>
                                  <th className="p-2">Hari & Jam</th>
                                  <th className="p-2">Ruang</th>
                                  <th className="p-2 text-right">SKS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/50 dark:bg-slate-900/50">
                                {item.matakuliah_rencana.map((mk, idx) => {
                                  const j = JADWAL_MAP[mk.kode];
                                  return (
                                    <tr key={idx}>
                                      <td className="p-2 font-medium">
                                        <span className="font-bold">{mk.kode}</span> — {mk.nama}
                                      </td>
                                      <td className="p-2 text-slate-600 dark:text-slate-400">
                                        {j ? `${j.hari}, ${j.mulai}–${j.selesai}` : 'Sesudah Perwalian'}
                                      </td>
                                      <td className="p-2 text-slate-600 dark:text-slate-400">
                                        {j ? j.ruang : '-'}
                                      </td>
                                      <td className="p-2 text-right font-bold">{mk.sks} SKS</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 pt-1">
                        Diproses pada: {formatDateIndonesian(item.tgl_persetujuan || item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
