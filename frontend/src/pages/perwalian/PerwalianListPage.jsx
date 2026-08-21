import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { perwalianService } from '../../services/perwalianService';
import { matakuliahService } from '../../services/matakuliahService';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { exportToExcel, exportToPDF } from '../../utils/exportHelpers';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Plus,
  FileSpreadsheet,
  FileText,
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  CheckCheck,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Manajemen & Pengajuan Perwalian STMIK Bandung
 * Alur Kerja:
 * 1. Mahasiswa menyusun KRS (katalog 8 semester) & menulis "Uraian Konsultasi (Kendala Akademik & Rencana Studi)".
 * 2. Dosen Wali memverifikasi KRS, memberikan "Catatan / Penyelesaian", dan Menyetujui / Menandai Selesai.
 * 3. Ekspor laporan lengkap ke Excel dan PDF.
 */
export const PerwalianListPage = () => {
  const { user, hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPerwalian, setSelectedPerwalian] = useState(null);

  // Form State Pengajuan Perwalian
  const [semesterInput, setSemesterInput] = useState('2025/2026 Ganjil');
  const [ipkInput, setIpkInput] = useState('0.00');
  const [catatanMhs, setCatatanMhs] = useState('');
  const [matakuliahList, setMatakuliahList] = useState([]);

  // Fetch Katalog Mata Kuliah Langsung dari Database
  const { data: dbMatkulResponse } = useQuery({
    queryKey: ['katalog-matakuliah-all'],
    queryFn: () => matakuliahService.getAllMatakuliah(),
  });

  const katalogMatkul = dbMatkulResponse?.data || [];

  // Helper konversi "HH:MM" ke menit
  const toMinutes = (t) => {
    if (!t || typeof t !== 'string') return 0;
    const parts = t.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  // Deteksi bentrok jadwal realtime dari database
  const detectConflicts = (list) => {
    if (!Array.isArray(list) || !Array.isArray(katalogMatkul) || katalogMatkul.length === 0) return [];
    const conflicts = [];
    const katalogMap = Object.fromEntries(katalogMatkul.map((m) => [m?.kode, m]));

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const mkI = katalogMap[list[i]?.kode];
        const mkJ = katalogMap[list[j]?.kode];
        if (!mkI || !mkJ) continue;

        if (mkI.hari === mkJ.hari && mkI.hari) {
          const startI = toMinutes(mkI.jam_mulai || mkI.mulai);
          const endI = toMinutes(mkI.jam_selesai || mkI.selesai);
          const startJ = toMinutes(mkJ.jam_mulai || mkJ.mulai);
          const endJ = toMinutes(mkJ.jam_selesai || mkJ.selesai);

          if (startI < endJ && startJ < endI) {
            conflicts.push(
              `[${mkI.kode}] ${mkI.nama} bentrok dengan [${mkJ.kode}] ${mkJ.nama} pada hari ${mkI.hari} (${mkI.jam_mulai || mkI.mulai}-${mkI.jam_selesai || mkI.selesai} WIB)`
            );
          }
        }
      }
    }
    return conflicts;
  };

  const conflicts = detectConflicts(matakuliahList);
  const [reviewStatus, setReviewStatus] = useState('Disetujui');
  const [catatanDosen, setCatatanDosen] = useState('');

  const { data: perwalianResponse, isLoading } = useQuery({
    queryKey: ['perwalian', page, statusFilter, semesterFilter],
    queryFn: () => perwalianService.getPerwalian({ page, status: statusFilter, semester: semesterFilter, per_page: 10 }),
  });

  const perwalianList = Array.isArray(perwalianResponse?.data) ? perwalianResponse.data : [];
  const meta = perwalianResponse?.meta || {};
  const totalSks = Array.isArray(matakuliahList)
    ? matakuliahList.reduce((acc, item) => acc + Number(item?.sks || 0), 0)
    : 0;

  const addMatakuliah = () => {
    setMatakuliahList([...matakuliahList, { kode: '', nama: '', sks: 0, kelas: 'Reguler A' }]);
  };

  const removeMatakuliah = (index) => {
    setMatakuliahList(matakuliahList.filter((_, idx) => idx !== index));
  };

  const updateMatakuliahField = (index, field, value) => {
    const updated = [...matakuliahList];
    updated[index][field] = value;
    setMatakuliahList(updated);
  };

  const openCreateModal = () => {
    setSelectedPerwalian(null);
    setSemesterInput('2025/2026 Ganjil');
    const mhsIpk = user?.mahasiswa?.ipk_terakhir;
    setIpkInput(mhsIpk !== undefined && mhsIpk !== null ? Number(mhsIpk).toFixed(2) : '0.00');
    setCatatanMhs('');
    // Mulai dengan 1 baris kosong (belum memilih matkul) agar tidak membingungkan mahasiswa
    setMatakuliahList([
      { kode: '', nama: '', sks: 0, kelas: 'Reguler A' },
    ]);
    setIsFormModalOpen(true);
  };

  const handleSelectMatkul = (index, kode) => {
    if (kode) {
      const isAlreadySelected = matakuliahList.some((m, idx) => idx !== index && m.kode === kode);
      if (isAlreadySelected) {
        toast.error('Mata kuliah ini sudah Anda pilih di baris lain. Silakan pilih mata kuliah yang berbeda.');
        return;
      }
    }
    const found = katalogMatkul.find((m) => m.kode === kode);
    const updated = [...matakuliahList];
    if (found) {
      updated[index] = {
        kode: found.kode,
        nama: found.nama,
        sks: found.sks,
        kelas: updated[index]?.kelas || 'Reguler A',
      };
    } else {
      updated[index] = { kode: '', nama: '', sks: 0, kelas: 'Reguler A' };
    }
    setMatakuliahList(updated);
  };

  const openEditModal = (item) => {
    if (item.status !== 'Pending') {
      toast.error('Perwalian hanya dapat diubah jika status masih Pending.');
      return;
    }
    setSelectedPerwalian(item);
    setSemesterInput(item.semester);
    setIpkInput(item.ipk_semester);
    setCatatanMhs(item.catatan_mahasiswa || '');
    setMatakuliahList(item.matakuliah_rencana || []);
    setIsFormModalOpen(true);
  };

  const openReviewModal = (item) => {
    setSelectedPerwalian(item);
    setReviewStatus('Disetujui');
    setCatatanDosen(item.catatan_dosen || '');
    setIsReviewModalOpen(true);
  };

  const openDetailModal = (item) => {
    setSelectedPerwalian(item);
    setIsDetailModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (selectedPerwalian) return perwalianService.updatePerwalian(selectedPerwalian.id, payload);
      return perwalianService.createPerwalian(payload);
    },
    onSuccess: async () => {
      toast.success(selectedPerwalian ? 'Pengajuan diperbarui.' : 'Pengajuan berhasil dikirim!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['perwalian'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-mahasiswa'] }),
        queryClient.refetchQueries({ queryKey: ['perwalian'] }),
      ]);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengajuan perwalian.');
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (matakuliahList.length === 0) {
      toast.error('Pilih minimal 1 mata kuliah.');
      return;
    }
    const emptyMatkul = matakuliahList.some((m) => !m.kode || !m.nama);
    if (emptyMatkul) {
      toast.error('Pastikan semua baris mata kuliah telah dipilih dari katalog database.');
      return;
    }
    const selectedKodes = matakuliahList.map((m) => m.kode).filter(Boolean);
    const hasDuplicateCourses = new Set(selectedKodes).size !== selectedKodes.length;
    if (hasDuplicateCourses) {
      toast.error('Tidak boleh memilih mata kuliah yang sama lebih dari satu kali.');
      return;
    }
    if (conflicts.length > 0) {
      toast.error('Selesaikan bentrok jadwal terlebih dahulu sebelum mengirim.');
      return;
    }
    saveMutation.mutate({
      semester: semesterInput,
      ipk_semester: parseFloat(ipkInput),
      sks_diambil: totalSks,
      matakuliah_rencana: matakuliahList,
      catatan_mahasiswa: catatanMhs,
    });
  };

  const reviewMutation = useMutation({
    mutationFn: (statusToSet) =>
      perwalianService.approveRejectPerwalian(selectedPerwalian.id, {
        status: statusToSet || reviewStatus,
        catatan_dosen: catatanDosen,
      }),
    onSuccess: async () => {
      toast.success(`Perwalian berhasil diverifikasi!`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['perwalian'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-dosen'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-admin'] }),
        queryClient.refetchQueries({ queryKey: ['perwalian'] }),
      ]);
      setIsReviewModalOpen(false);
    },
    onError: () => toast.error('Gagal memproses verifikasi perwalian.'),
  });

  const handleQuickApprove = (item) => {
    MySwal.fire({
      title: 'Verifikasi & Setujui Perwalian?',
      text: `Apakah Anda yakin menyetujui pengajuan ${item.mahasiswa?.nama_lengkap} (${item.semester}) dan menandainya Selesai?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Setujui & Selesai',
      cancelButtonText: 'Batal',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await perwalianService.approveRejectPerwalian(item.id, {
            status: 'Disetujui',
            catatan_dosen: 'Telah diverifikasi, disetujui, dan bimbingan dinyatakan selesai oleh Dosen Pembimbing Akademik.',
          });
          toast.success('Perwalian berhasil disetujui dan ditandai selesai.');
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['perwalian'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard-dosen'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard-admin'] }),
            queryClient.refetchQueries({ queryKey: ['perwalian'] }),
          ]);
        } catch (e) {
          toast.error('Gagal memproses persetujuan.');
        }
      }
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => perwalianService.deletePerwalian(id),
    onSuccess: async () => {
      toast.success('Pengajuan perwalian dibatalkan.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['perwalian'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-mahasiswa'] }),
        queryClient.refetchQueries({ queryKey: ['perwalian'] }),
      ]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal membatalkan pengajuan.');
    },
  });

  const handleDelete = (item) => {
    if (item.status !== 'Pending') return toast.error('Perwalian hanya dapat dihapus jika status masih Pending.');
    MySwal.fire({
      title: 'Hapus Pengajuan?',
      text: 'Apakah Anda yakin ingin membatalkan pengajuan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        deleteMutation.mutate(item.id);
      }
    });
  };

  const handleExportExcel = async () => {
    try {
      const res = await perwalianService.exportExcel({ status: statusFilter, semester: semesterFilter });
      if (!res.data || res.data.length <= 1) {
        toast.info('Belum ada data perwalian yang dapat diekspor ke Excel.');
        return;
      }
      exportToExcel(res.data, 'Rekap_Perwalian_STMIK_Bandung');
      toast.success('File Excel rekap perwalian berhasil didownload.');
    } catch (err) {
      toast.error('Gagal mengunduh file Excel.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const allDataRes = await perwalianService.getPerwalian({ per_page: 1000, status: statusFilter, semester: semesterFilter });
      const allPerwalian = allDataRes?.data || [];
      if (allPerwalian.length === 0) {
        toast.info('Belum ada data perwalian yang dapat diekspor ke PDF.');
        return;
      }
      toast.info('Menyiapkan file PDF...');
      const headers = ['No', 'NIM', 'Nama Mahasiswa', 'Dosen Pembimbing', 'Semester', 'IPK', 'SKS', 'Status'];
      const rows = allPerwalian.map((p, idx) => [
        idx + 1,
        p.mahasiswa?.nim || '-',
        p.mahasiswa?.nama_lengkap || '-',
        p.dosen?.nama_lengkap || '-',
        p.semester,
        p.ipk_semester,
        `${p.sks_diambil} SKS`,
        p.status,
      ]);
      exportToPDF(headers, rows, 'Laporan Rekapitulasi Perwalian Mahasiswa STMIK Bandung', 'Rekap_Perwalian_STMIK_Bandung');
      toast.success(`Berhasil mengunduh ${allPerwalian.length} data Perwalian ke PDF.`);
    } catch (err) {
      toast.error('Gagal mengekspor data ke PDF.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Daftar & Pengajuan Perwalian"
        description="Pencatatan bimbingan akademik perwalian mahasiswa, penyusunan KRS dari database mata kuliah resmi, serta verifikasi dan persetujuan Dosen Pembimbing."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={handleExportPDF}>
              Export PDF
            </Button>
            {hasRole('Mahasiswa') && (
              <Button size="sm" icon={Plus} onClick={openCreateModal}>
                Ajukan Perwalian Baru
              </Button>
            )}
          </div>
        }
      />

      <Card hover={false} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            placeholder="Semua Status Persetujuan"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Status (Pending / Disetujui / Ditolak)' },
              { value: 'Pending', label: 'Pending (Menunggu Dosen)' },
              { value: 'Disetujui', label: 'Disetujui / Selesai' },
              { value: 'Ditolak', label: 'Ditolak / Butuh Revisi' },
            ]}
          />
          <Select
            placeholder="Semua Semester"
            value={semesterFilter}
            onChange={(e) => {
              setSemesterFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Semester' },
              { value: '2025/2026 Ganjil', label: '2025/2026 Ganjil' },
              { value: '2024/2025 Genap', label: '2024/2025 Genap' },
              { value: '2024/2025 Ganjil', label: '2024/2025 Ganjil' },
            ]}
          />
        </div>
      </Card>

      <Card hover={false}>
        {isLoading ? (
          <LoadingSpinner text="Memuat data bimbingan perwalian mahasiswa..." fullHeight />
        ) : perwalianList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Data Perwalian"
            description="Belum ada pengajuan perwalian ditemukan."
            action={
              hasRole('Mahasiswa') ? (
                <Button size="sm" icon={Plus} onClick={openCreateModal}>
                  Ajukan Perwalian Baru
                </Button>
              ) : null
            }
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Mahasiswa</th>
                    <th className="p-3">Dosen Pembimbing</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">IPK</th>
                    <th className="p-3">SKS</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi & Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {perwalianList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-400">#{item.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{item.mahasiswa?.nama_lengkap}</p>
                        <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">{item.mahasiswa?.nim}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.dosen?.nama_lengkap}</td>
                      <td className="p-3 font-semibold">{item.semester}</td>
                      <td className="p-3 font-bold">{item.ipk_semester}</td>
                      <td className="p-3 font-medium">{item.sks_diambil} SKS</td>
                      <td className="p-3">
                        <Badge status={item.status} />
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" title="Lihat Detail & Jadwal" onClick={() => openDetailModal(item)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {(hasRole('Dosen') || hasRole('Admin')) && (
                          <>
                            <Button size="sm" variant={item.status === 'Pending' ? 'primary' : 'outline'} onClick={() => openReviewModal(item)}>
                              Verifikasi
                            </Button>
                            {item.status === 'Pending' && (
                              <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300" onClick={() => handleQuickApprove(item)}>
                                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                                Selesai
                              </Button>
                            )}
                          </>
                        )}

                        {hasRole('Mahasiswa') && item.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="ghost" title="Edit Pengajuan" onClick={() => openEditModal(item)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Batalkan Pengajuan" className="text-rose-600 hover:text-rose-700" onClick={() => handleDelete(item)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Halaman {meta.current_page || 1} dari {meta.last_page || 1} (Total {meta.total || 0} Pengajuan)</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="outline" disabled={page >= (meta.last_page || 1)} onClick={() => setPage((p) => p + 1)}>Selanjutnya</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form Pengajuan Perwalian dengan Jadwal Lengkap */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedPerwalian ? 'Edit Pengajuan Perwalian' : 'Form Pengajuan Perwalian Baru'} maxWidth="max-w-4xl">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Semester Akademik" value={semesterInput} onChange={(e) => setSemesterInput(e.target.value)} required />
            <Input label="IPK Semester Lalu (Terkunci)" value={ipkInput} readOnly className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400 cursor-not-allowed" />
          </div>

          {/* Dynamic Matakuliah JSON Builder dari Katalog Resmi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  Rencana Mata Kuliah KRS (Katalog Semester 1 - 8)
                </label>
                <p className="text-[11px] text-slate-500">Total SKS Diambil: <strong className="text-primary-600">{totalSks} SKS</strong></p>
              </div>
              <Button type="button" size="sm" variant="outline" icon={PlusCircle} onClick={addMatakuliah}>
                Tambah Matkul
              </Button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {matakuliahList.map((item, index) => {
                const mkInfo = katalogMatkul.find((m) => m.kode === item.kode);
                const isConflicted = conflicts.some((c) => c.includes(item.kode));

                return (
                  <div
                    key={index}
                    className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
                      isConflicted
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 ring-1 ring-rose-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 min-w-0">
                        <select
                          className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                          value={item.kode}
                          onChange={(e) => handleSelectMatkul(index, e.target.value)}
                          required
                        >
                          <option value="">-- Pilih Mata Kuliah --</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                            const coursesInSem = katalogMatkul.filter((m) => Number(m.semester) === Number(sem));
                            if (coursesInSem.length === 0) return null;
                            return (
                              <optgroup key={sem} label={`=== SEMESTER ${sem} ===`}>
                                {coursesInSem.map((m) => {
                                  const isSelectedElsewhere = matakuliahList.some(
                                    (other, oIdx) => oIdx !== index && other.kode === m.kode
                                  );
                                  return (
                                    <option
                                      key={m.kode}
                                      value={m.kode}
                                      disabled={isSelectedElsewhere}
                                      className={isSelectedElsewhere ? 'text-slate-400 bg-slate-100 dark:bg-slate-800' : ''}
                                    >
                                      [{m.kode}] {m.nama} — {m.sks} SKS ({m.hari}, {m.jam_mulai || m.mulai}-{m.jam_selesai || m.selesai})
                                      {isSelectedElsewhere ? ' (Sudah Dipilih)' : ''}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            );
                          })}
                        </select>
                      </div>

                      <div className="w-44 flex-shrink-0">
                        <select
                          className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                          value={item.kelas || 'Reguler A'}
                          onChange={(e) => updateMatakuliahField(index, 'kelas', e.target.value)}
                          required
                        >
                          <option value="Reguler A">Kelas Reguler A</option>
                          <option value="Reguler B">Kelas Reguler B</option>
                          <option value="Reguler C">Kelas Reguler C</option>
                          <option value="Karyawan">Kelas Karyawan</option>
                        </select>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-700 flex-shrink-0"
                        onClick={() => removeMatakuliah(index)}
                        title="Hapus Baris Mata Kuliah"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Informasi Jadwal & Ruangan Realtime dari Database */}
                    {mkInfo && (
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 dark:text-slate-300 px-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-primary-500" />
                          {mkInfo.hari}, {mkInfo.jam_mulai || mkInfo.mulai}–{mkInfo.jam_selesai || mkInfo.selesai} WIB
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {mkInfo.ruangan || mkInfo.ruang}
                        </span>
                        {mkInfo.dosen_pengampu && (
                          <span className="text-slate-500 font-medium hidden sm:inline">
                            Dosen: {mkInfo.dosen_pengampu}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-extrabold ml-auto">
                          {mkInfo.sks} SKS
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Alert Jadwal Bentrok */}
            {conflicts.length > 0 && (
              <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 space-y-1.5 animate-pulse">
                <p className="text-xs font-extrabold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Terdeteksi Bentrok Jadwal Kuliah!
                </p>
                {conflicts.map((c, i) => (
                  <p key={i} className="text-xs text-rose-600 dark:text-rose-400 font-medium">{c}</p>
                ))}
                <p className="text-[11px] text-rose-500 pt-1">Harap ganti mata kuliah atau sesuaikan jadwal yang bentrok sebelum mengirim pengajuan.</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Uraian Konsultasi (Kendala Akademik & Rencana Studi)
            </label>
            <textarea
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              rows={4}
              placeholder="Tuliskan uraian konsultasi Anda secara lengkap mengenai kendala akademik, alasan rencana pengambilan mata kuliah/SKS semester ini..."
              value={catatanMhs}
              onChange={(e) => setCatatanMhs(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Batal</Button>
            <Button
              type="submit"
              isLoading={saveMutation.isLoading}
              disabled={conflicts.length > 0 || saveMutation.isLoading}
            >
              {conflicts.length > 0 ? `Ada Bentrok (${conflicts.length})` : 'Kirim Pengajuan Perwalian'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Review Approval (Dosen Wali) */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Verifikasi & Keputusan Perwalian: ${selectedPerwalian?.mahasiswa?.nama_lengkap}`} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs space-y-2.5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Mahasiswa:</span>
              <strong className="text-slate-900 dark:text-slate-100 text-sm font-extrabold">{selectedPerwalian?.mahasiswa?.nama_lengkap} ({selectedPerwalian?.mahasiswa?.nim})</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Program Studi / Semester:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPerwalian?.mahasiswa?.prodi} • {selectedPerwalian?.semester}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total SKS Diajukan:</span>
              <strong className="text-primary-600 dark:text-primary-400 font-bold">{selectedPerwalian?.sks_diambil} SKS</strong>
            </div>

            {/* Informasi Kontak Mahasiswa */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Kontak Mahasiswa:</span>
              <div className="flex flex-wrap items-center gap-2">
                {(selectedPerwalian?.mahasiswa?.email || selectedPerwalian?.mahasiswa?.user?.email) && (
                  <a
                    href={`mailto:${selectedPerwalian?.mahasiswa?.email || selectedPerwalian?.mahasiswa?.user?.email}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium hover:bg-blue-100 transition-colors"
                    title="Kirim Email ke Mahasiswa"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedPerwalian?.mahasiswa?.email || selectedPerwalian?.mahasiswa?.user?.email}</span>
                  </a>
                )}
                {(selectedPerwalian?.mahasiswa?.no_hp || selectedPerwalian?.mahasiswa?.user?.phone_number) && (
                  <a
                    href={`https://wa.me/${(selectedPerwalian?.mahasiswa?.no_hp || selectedPerwalian?.mahasiswa?.user?.phone_number).replace(/^0/, '62').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold hover:bg-emerald-100 transition-colors"
                    title="Hubungi Mahasiswa via WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp: {selectedPerwalian?.mahasiswa?.no_hp || selectedPerwalian?.mahasiswa?.user?.phone_number}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {selectedPerwalian?.catatan_mahasiswa && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
              <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Uraian Konsultasi Mahasiswa:</p>
              <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{selectedPerwalian.catatan_mahasiswa}</p>
            </div>
          )}

          <Select
            label="Keputusan Verifikasi Dosen Wali"
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            options={[
              { value: 'Disetujui', label: 'Disetujui (Tandai Bimbingan Selesai & Validasi KRS)' },
              { value: 'Ditolak', label: 'Ditolak / Revisi (Kembalikan ke Mahasiswa untuk Perbaikan)' },
            ]}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Catatan / Penyelesaian dari Dosen Wali</label>
            <textarea
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              rows={4}
              placeholder="Tuliskan arahan akademik, saran penyelesaian kendala, atau instruksi perbaikan KRS untuk mahasiswa..."
              value={catatanDosen}
              onChange={(e) => setCatatanDosen(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>Batal</Button>
            <Button
              variant={reviewStatus === 'Disetujui' ? 'primary' : 'danger'}
              onClick={() => reviewMutation.mutate(reviewStatus)}
              isLoading={reviewMutation.isLoading}
            >
              {reviewStatus === 'Disetujui' ? 'Verifikasi & Tandai Selesai' : 'Kirim Catatan Revisi'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detail Perwalian Lengkap dengan Jadwal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detail Perwalian #${selectedPerwalian?.id}`} maxWidth="max-w-2xl">
        {selectedPerwalian && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPerwalian.mahasiswa?.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedPerwalian.mahasiswa?.nama_lengkap || 'Mhs')}`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedPerwalian.mahasiswa?.nama_lengkap} ({selectedPerwalian.mahasiswa?.nim})</p>
                    <p className="text-slate-500 font-medium">Dosen Wali: {selectedPerwalian.dosen?.nama_lengkap} • {selectedPerwalian.semester}</p>
                  </div>
                </div>
                <Badge status={selectedPerwalian.status} />
              </div>

              {/* Baris Kontak Mahasiswa */}
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-medium text-[11px]">Kontak Mahasiswa:</span>
                {(selectedPerwalian.mahasiswa?.email || selectedPerwalian.mahasiswa?.user?.email) && (
                  <a
                    href={`mailto:${selectedPerwalian.mahasiswa?.email || selectedPerwalian.mahasiswa?.user?.email}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium hover:underline"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{selectedPerwalian.mahasiswa?.email || selectedPerwalian.mahasiswa?.user?.email}</span>
                  </a>
                )}
                {(selectedPerwalian.mahasiswa?.no_hp || selectedPerwalian.mahasiswa?.user?.phone_number) && (
                  <a
                    href={`https://wa.me/${(selectedPerwalian.mahasiswa?.no_hp || selectedPerwalian.mahasiswa?.user?.phone_number).replace(/^0/, '62').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp: {selectedPerwalian.mahasiswa?.no_hp || selectedPerwalian.mahasiswa?.user?.phone_number}</span>
                  </a>
                )}
              </div>
            </div>

            {selectedPerwalian.catatan_mahasiswa && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Uraian Konsultasi (Kendala Akademik & Rencana Studi):</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedPerwalian.catatan_mahasiswa}</p>
              </div>
            )}

            {selectedPerwalian.catatan_dosen && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Catatan / Penyelesaian dari Dosen Wali:
                </p>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-medium">{selectedPerwalian.catatan_dosen}</p>
              </div>
            )}

            {/* Jadwal & Rencana Mata Kuliah Lengkap */}
            <div>
              <p className="font-bold mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-600" /> Jadwal & Rencana Mata Kuliah ({selectedPerwalian.sks_diambil} SKS):
              </p>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Kode & Mata Kuliah</th>
                      <th className="p-2.5">Hari & Waktu</th>
                      <th className="p-2.5">Ruang</th>
                      <th className="p-2.5 text-right">SKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedPerwalian.matakuliah_rencana?.map((mk, i) => {
                      const katalog = katalogMatkul.find((m) => m.kode === mk.kode);
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-2.5 font-medium">
                            <span className="font-bold text-primary-600 dark:text-primary-400">{mk.kode}</span> — {mk.nama}
                            {mk.kelas && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">Kls {mk.kelas}</span>}
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            {katalog ? `${katalog.hari}, ${katalog.jam_mulai || katalog.mulai}–${katalog.jam_selesai || katalog.selesai} WIB` : '-'}
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            {katalog ? (katalog.ruangan || katalog.ruang) : '-'}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100">{mk.sks} SKS</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
