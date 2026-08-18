import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { perwalianService } from '../../services/perwalianService';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateIndonesian } from '../../utils/formatters';
import { exportToExcel, exportToPDF } from '../../utils/exportHelpers';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Plus,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Eye,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Utama Pengajuan & Approval Perwalian Mahasiswa STMIK Bandung
 * Mengendalikan alur pengajuan perwalian oleh Mahasiswa, edit/hapus status Pending, dan review approval/rejection oleh Dosen Wali.
 */
export const PerwalianListPage = () => {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuthStore();

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
  const [ipkInput, setIpkInput] = useState('3.50');
  const [catatanMhs, setCatatanMhs] = useState('');
  const [matakuliahList, setMatakuliahList] = useState([
    { kode: 'IF-101', nama: 'Algoritma & Pemrograman', sks: 4, kelas: 'IF-A' },
    { kode: 'IF-102', nama: 'Basis Data Enterprise', sks: 3, kelas: 'IF-A' },
  ]);

  // Review Form State Dosen
  const [reviewStatus, setReviewStatus] = useState('Disetujui');
  const [catatanDosen, setCatatanDosen] = useState('');

  // Fetch Data Perwalian
  const { data: perwalianResponse, isLoading } = useQuery({
    queryKey: ['perwalian', page, statusFilter, semesterFilter],
    queryFn: () => perwalianService.getPerwalian({ page, status: statusFilter, semester: semesterFilter, per_page: 10 }),
  });

  const perwalianList = perwalianResponse?.data || [];
  const meta = perwalianResponse?.meta || {};

  // Hitung Total SKS Rencana
  const totalSks = matakuliahList.reduce((acc, item) => acc + Number(item.sks || 0), 0);

  const addMatakuliah = () => {
    setMatakuliahList([...matakuliahList, { kode: '', nama: '', sks: 3, kelas: 'IF-A' }]);
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
    setIpkInput('3.50');
    setCatatanMhs('');
    setMatakuliahList([
      { kode: 'IF-101', nama: 'Algoritma & Pemrograman', sks: 4, kelas: 'IF-A' },
      { kode: 'IF-102', nama: 'Basis Data Enterprise', sks: 3, kelas: 'IF-A' },
    ]);
    setIsFormModalOpen(true);
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
    setCatatanDosen('');
    setIsReviewModalOpen(true);
  };

  const openDetailModal = (item) => {
    setSelectedPerwalian(item);
    setIsDetailModalOpen(true);
  };

  // Submit Form Pengajuan/Edit Mahasiswa
  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (selectedPerwalian) {
        return perwalianService.updatePerwalian(selectedPerwalian.id, payload);
      }
      return perwalianService.createPerwalian(payload);
    },
    onSuccess: () => {
      toast.success(selectedPerwalian ? 'Pengajuan perwalian diperbarui.' : 'Pengajuan perwalian berhasil disimpan!');
      queryClient.invalidateQueries(['perwalian']);
      queryClient.invalidateQueries(['dashboard-mahasiswa']);
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
    saveMutation.mutate({
      semester: semesterInput,
      ipk_semester: parseFloat(ipkInput),
      sks_diambil: totalSks,
      matakuliah_rencana: matakuliahList,
      catatan_mahasiswa: catatanMhs,
    });
  };

  // Submit Approval Dosen
  const reviewMutation = useMutation({
    mutationFn: () =>
      perwalianService.approveRejectPerwalian(selectedPerwalian.id, {
        status: reviewStatus,
        catatan_dosen: catatanDosen,
      }),
    onSuccess: () => {
      toast.success(`Perwalian berhasil di-${reviewStatus}!`);
      queryClient.invalidateQueries(['perwalian']);
      queryClient.invalidateQueries(['dashboard-dosen']);
      setIsReviewModalOpen(false);
    },
    onError: (err) => {
      toast.error('Gagal memproses persetujuan perwalian.');
    },
  });

  // Delete Action
  const handleDelete = (item) => {
    if (item.status !== 'Pending') {
      toast.error('Perwalian hanya dapat dihapus jika status masih Pending.');
      return;
    }
    MySwal.fire({
      title: 'Hapus Pengajuan Perwalian?',
      text: 'Apakah Anda yakin ingin membatalkan pengajuan perwalian ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus',
    }).then((res) => {
      if (res.isConfirmed) {
        perwalianService.deletePerwalian(item.id).then(() => {
          toast.success('Pengajuan perwalian berhasil dibatalkan.');
          queryClient.invalidateQueries(['perwalian']);
        });
      }
    });
  };

  // Export Excel Action
  const handleExportExcel = async () => {
    try {
      const res = await perwalianService.exportExcel();
      exportToExcel(res.data, 'Rekap_Perwalian_STMIK_Bandung');
      toast.success('File Excel rekap perwalian berhasil didownload.');
    } catch (err) {
      toast.error('Gagal mengunduh file Excel.');
    }
  };

  // Export PDF Action (Seluruh Data Perwalian)
  const handleExportPDF = async () => {
    try {
      toast.info('Menyiapkan file PDF seluruh data...');
      const allDataRes = await perwalianService.getPerwalian({ per_page: 1000, status: statusFilter, semester: semesterFilter });
      const allPerwalian = allDataRes?.data || perwalianList;
      const headers = ['ID', 'Nama Mahasiswa', 'NIM', 'Dosen Wali', 'Semester', 'IPK', 'SKS', 'Status'];
      const rows = allPerwalian.map((p) => [
        `#${p.id}`,
        p.mahasiswa?.nama_lengkap || '-',
        p.mahasiswa?.nim || '-',
        p.dosen?.nama_lengkap || '-',
        p.semester,
        p.ipk_semester,
        `${p.sks_diambil} SKS`,
        p.status,
      ]);
      exportToPDF(headers, rows, 'Laporan Rekapitulasi Perwalian Mahasiswa STMIK Bandung (Seluruh Data)', 'Rekap_Perwalian_STMIK_Bandung');
      toast.success(`Berhasil mengunduh ${allPerwalian.length} data Perwalian ke PDF.`);
    } catch (err) {
      toast.error('Gagal mengekspor data ke PDF.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Daftar & Pengajuan Perwalian"
        description="Pencatatan bimbingan akademik perwalian mahasiswa, penyusunan KRS, dan persetujuan Dosen Wali."
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

      {/* Filter Bar */}
      <Card hover={false} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            placeholder="Semua Status Persetujuan"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Disetujui', label: 'Disetujui' },
              { value: 'Ditolak', label: 'Ditolak' },
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

      {/* Table Perwalian */}
      <Card hover={false}>
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
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
                    <th className="p-3">Dosen Wali</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">IPK</th>
                    <th className="p-3">SKS</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {perwalianList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-semibold">#{item.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        {item.mahasiswa?.nama_lengkap} <br />
                        <span className="text-[10px] text-slate-400 font-normal">{item.mahasiswa?.nim}</span>
                      </td>
                      <td className="p-3 font-medium">{item.dosen?.nama_lengkap}</td>
                      <td className="p-3 font-semibold">{item.semester}</td>
                      <td className="p-3 font-bold">{item.ipk_semester}</td>
                      <td className="p-3">{item.sks_diambil} SKS</td>
                      <td className="p-3">
                        <Badge status={item.status} />
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => openDetailModal(item)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {hasRole('Dosen') && item.status === 'Pending' && (
                          <Button size="sm" onClick={() => openReviewModal(item)}>
                            Review
                          </Button>
                        )}

                        {hasRole('Mahasiswa') && item.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => openEditModal(item)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleDelete(item)}>
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Halaman {meta.current_page || 1} dari {meta.last_page || 1}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Sebelumnya
                </Button>
                <Button size="sm" variant="outline" disabled={page >= (meta.last_page || 1)} onClick={() => setPage((p) => p + 1)}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form Pengajuan / Edit Perwalian (Mahasiswa) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedPerwalian ? 'Edit Pengajuan Perwalian' : 'Form Pengajuan Perwalian Baru'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Semester Academic" value={semesterInput} onChange={(e) => setSemesterInput(e.target.value)} required />
            <Input label="IPK Semester Lalu" type="number" step="0.01" value={ipkInput} onChange={(e) => setIpkInput(e.target.value)} required />
          </div>

          {/* Dynamic Matakuliah JSON Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rencana Mata Kuliah ({totalSks} SKS)
              </label>
              <Button type="button" size="sm" variant="outline" icon={PlusCircle} onClick={addMatakuliah}>
                Tambah Matkul
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {matakuliahList.map((mk, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900">
                  <input
                    type="text"
                    placeholder="Kode (IF-101)"
                    className="w-24 text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950"
                    value={mk.kode}
                    onChange={(e) => updateMatakuliahField(idx, 'kode', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nama Mata Kuliah"
                    className="flex-1 text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950"
                    value={mk.nama}
                    onChange={(e) => updateMatakuliahField(idx, 'nama', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="SKS"
                    className="w-16 text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950"
                    value={mk.sks}
                    onChange={(e) => updateMatakuliahField(idx, 'sks', parseInt(e.target.value) || 0)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeMatakuliah(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Catatan/Kendala Mahasiswa (Opsional)
            </label>
            <textarea
              rows={3}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
              placeholder="Tuliskan kendala atau permohonan ke Dosen Wali..."
              value={catatanMhs}
              onChange={(e) => setCatatanMhs(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saveMutation.isLoading}>
              Kirim Pengajuan Perwalian
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Review Approval (Dosen Wali) */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review Perwalian: ${selectedPerwalian?.mahasiswa?.nama_lengkap}`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs space-y-1">
            <p><strong>NIM:</strong> {selectedPerwalian?.mahasiswa?.nim}</p>
            <p><strong>Semester:</strong> {selectedPerwalian?.semester}</p>
            <p><strong>Total SKS Rencana:</strong> {selectedPerwalian?.sks_diambil} SKS</p>
          </div>

          <Select
            label="Keputusan Persetujuan"
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            options={[
              { value: 'Disetujui', label: 'Disetujui (Approve)' },
              { value: 'Ditolak', label: 'Ditolak (Reject)' },
            ]}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Catatan Dosen Wali
            </label>
            <textarea
              rows={3}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
              placeholder="Berikan saran atau alasan persetujuan/penolakan..."
              value={catatanDosen}
              onChange={(e) => setCatatanDosen(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant={reviewStatus === 'Disetujui' ? 'primary' : 'danger'}
              onClick={() => reviewMutation.mutate()}
              isLoading={reviewMutation.isLoading}
            >
              Simpan Keputusan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detail Perwalian */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Detail Perwalian #${selectedPerwalian?.id}`}
      >
        {selectedPerwalian && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedPerwalian.mahasiswa?.nama_lengkap} ({selectedPerwalian.mahasiswa?.nim})
                </p>
                <p className="text-slate-500">Dosen Wali: {selectedPerwalian.dosen?.nama_lengkap}</p>
              </div>
              <Badge status={selectedPerwalian.status} />
            </div>

            <div>
              <p className="font-bold mb-1">Rencana Mata Kuliah:</p>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1">
                {selectedPerwalian.matakuliah_rencana?.map((mk, i) => (
                  <div key={i} className="flex justify-between p-1 bg-white dark:bg-slate-950 rounded-lg">
                    <span>{mk.kode} - {mk.nama}</span>
                    <span className="font-bold">{mk.sks} SKS</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedPerwalian.catatan_dosen && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <p className="font-bold text-blue-900 dark:text-blue-200">Catatan Dosen Wali:</p>
                <p className="text-blue-800 dark:text-blue-300 mt-0.5">{selectedPerwalian.catatan_dosen}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
