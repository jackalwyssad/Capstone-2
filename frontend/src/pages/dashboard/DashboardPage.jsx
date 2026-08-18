import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCards } from '../../components/dashboard/ChartCards';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { Skeleton } from '../../components/common/Skeleton';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Users,
  GraduationCap,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Halaman Utama Dashboard Multi-Role (Admin, Dosen Wali, Mahasiswa)
 * Menggunakan TanStack React Query untuk fetch data statistik dan Recharts untuk visualisasi grafik.
 */
export const DashboardPage = () => {
  const { user, hasRole } = useAuthStore();
  const navigate = useNavigate();

  // Fetch Dashboard Admin
  const { data: adminData, isLoading: isAdminLoading } = useQuery({
    queryKey: ['dashboard-admin'],
    queryFn: dashboardService.getAdminDashboard,
    enabled: hasRole('Admin'),
  });

  // Fetch Dashboard Dosen
  const { data: dosenData, isLoading: isDosenLoading } = useQuery({
    queryKey: ['dashboard-dosen'],
    queryFn: dashboardService.getDosenDashboard,
    enabled: hasRole('Dosen'),
  });

  // Fetch Dashboard Mahasiswa
  const { data: mhsData, isLoading: isMhsLoading } = useQuery({
    queryKey: ['dashboard-mahasiswa'],
    queryFn: dashboardService.getMahasiswaDashboard,
    enabled: hasRole('Mahasiswa'),
  });

  const isLoading = isAdminLoading || isDosenLoading || isMhsLoading;

  return (
    <div>
      <PageHeader
        title={`Selamat Datang, ${user?.name || 'User'}!`}
        description={`Dashboard Portal Academic Perwalian STMIK Bandung — Role: ${user?.roles?.[0] || 'User'}`}
        actions={
          hasRole('Mahasiswa') ? (
            <Button onClick={() => navigate('/perwalian')} icon={PlusCircle}>
              Pengajuan Perwalian
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        <>
          {/* TAMPILAN DASHBOARD ADMIN */}
          {hasRole('Admin') && adminData?.data && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <StatCard
                  title="Total Mahasiswa"
                  value={adminData.data.stats.total_mahasiswa}
                  icon={GraduationCap}
                  color="blue"
                  description="Terdaftar aktif di sistem"
                />
                <StatCard
                  title="Total Dosen Wali"
                  value={adminData.data.stats.total_dosen}
                  icon={Users}
                  color="purple"
                  description="Dosen pembimbing perwalian"
                />
                <StatCard
                  title="Total Transaksi Perwalian"
                  value={adminData.data.stats.total_perwalian}
                  icon={FileCheck}
                  color="emerald"
                  description="Keseluruhan pengajuan perwalian"
                />
              </div>

              {/* Recharts Bar & Pie Chart */}
              <ChartCards
                chartSemester={adminData.data.chart_semester}
                chartStatus={adminData.data.chart_status}
              />

              {/* Recent Activity Timeline */}
              <ActivityTimeline activities={adminData.data.recent_activities} />
            </div>
          )}

          {/* TAMPILAN DASHBOARD DOSEN WALI */}
          {hasRole('Dosen') && dosenData?.data && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Mahasiswa Bimbingan"
                  value={dosenData.data.stats.total_mahasiswa}
                  icon={GraduationCap}
                  color="blue"
                />
                <StatCard
                  title="Butuh Persetujuan"
                  value={dosenData.data.stats.pending}
                  icon={Clock}
                  color="amber"
                  description="Status Pending"
                />
                <StatCard
                  title="Perwalian Disetujui"
                  value={dosenData.data.stats.approved}
                  icon={CheckCircle}
                  color="emerald"
                />
                <StatCard
                  title="Perwalian Ditolak"
                  value={dosenData.data.stats.rejected}
                  icon={XCircle}
                  color="rose"
                />
              </div>

              {/* Table Pending Approvals Quick Action */}
              <Card hover={false} className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                    Pengajuan Perwalian Menunggu Persetujuan Anda
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => navigate('/perwalian')}>
                    Lihat Semua
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">NIM</th>
                        <th className="p-3">Nama Mahasiswa</th>
                        <th className="p-3">Semester</th>
                        <th className="p-3">IPK</th>
                        <th className="p-3">SKS</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {dosenData.data.pending_approvals.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-slate-400">
                            Tidak ada pengajuan perwalian pending saat ini.
                          </td>
                        </tr>
                      ) : (
                        dosenData.data.pending_approvals.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="p-3 font-semibold">{item.mahasiswa?.nim}</td>
                            <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                              {item.mahasiswa?.nama_lengkap}
                            </td>
                            <td className="p-3">{item.semester}</td>
                            <td className="p-3">{item.ipk_semester}</td>
                            <td className="p-3">{item.sks_diambil} SKS</td>
                            <td className="p-3">
                              <Badge status={item.status} />
                            </td>
                            <td className="p-3 text-right">
                              <Button size="sm" onClick={() => navigate('/perwalian')}>
                                Review & Catatan
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAMPILAN DASHBOARD MAHASISWA */}
          {hasRole('Mahasiswa') && mhsData?.data && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Total Perwalian"
                  value={mhsData.data.stats.total_perwalian}
                  icon={FileText}
                  color="blue"
                />
                <StatCard
                  title="Pending"
                  value={mhsData.data.stats.pending}
                  icon={Clock}
                  color="amber"
                />
                <StatCard
                  title="Disetujui"
                  value={mhsData.data.stats.approved}
                  icon={CheckCircle}
                  color="emerald"
                />
                <StatCard
                  title="Ditolak"
                  value={mhsData.data.stats.rejected}
                  icon={XCircle}
                  color="rose"
                />
              </div>

              {/* Status Perwalian Aktif & Dosen Wali Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card hover={false} className="lg:col-span-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 font-sans flex items-center justify-between">
                    <span>Pengajuan Perwalian Terbaru</span>
                    {mhsData.data.active_perwalian && (
                      <Badge status={mhsData.data.active_perwalian.status} />
                    )}
                  </h3>

                  {mhsData.data.active_perwalian ? (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                        <div>
                          <p className="text-slate-400">Semester</p>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {mhsData.data.active_perwalian.semester}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">IPK Semester</p>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {mhsData.data.active_perwalian.ipk_semester}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">SKS Diambil</p>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {mhsData.data.active_perwalian.sks_diambil} SKS
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Tanggal Pengajuan</p>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {mhsData.data.active_perwalian.created_at?.slice(0, 10)}
                          </p>
                        </div>
                      </div>

                      {mhsData.data.active_perwalian.catatan_dosen && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200">
                          <p className="font-bold">Catatan Dosen Wali:</p>
                          <p className="mt-0.5">{mhsData.data.active_perwalian.catatan_dosen}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      Anda belum pernah mengajukan perwalian.
                    </div>
                  )}
                </Card>

                {/* Info Dosen Wali */}
                <Card hover={false}>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 font-sans">
                    Dosen Pembimbing Akademik
                  </h3>
                  {mhsData.data.dosen_wali ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900">
                        <p className="font-extrabold text-sm text-primary-900 dark:text-primary-100">
                          {mhsData.data.dosen_wali.nama_lengkap}
                        </p>
                        <p className="text-primary-600 dark:text-primary-400 font-semibold mt-0.5">
                          NIDN: {mhsData.data.dosen_wali.nidn}
                        </p>
                      </div>
                      <div className="space-y-1 text-slate-600 dark:text-slate-400">
                        <p>
                          <strong className="text-slate-900 dark:text-slate-200">Email:</strong>{' '}
                          {mhsData.data.dosen_wali.email}
                        </p>
                        <p>
                          <strong className="text-slate-900 dark:text-slate-200">No. WhatsApp:</strong>{' '}
                          {mhsData.data.dosen_wali.no_hp || '-'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-500 font-semibold">
                      Anda belum ditetapkan Dosen Wali. Hubungi Admin.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
