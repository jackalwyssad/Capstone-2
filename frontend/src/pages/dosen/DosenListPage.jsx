import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dosenService } from '../../services/dosenService';
import { mahasiswaService } from '../../services/mahasiswaService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { exportToExcel, exportToPDF } from '../../utils/exportHelpers';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForm } from 'react-hook-form';
import {
  Search,
  Plus,
  UserCheck,
  Pencil,
  Trash2,
  Key,
  FileSpreadsheet,
  FileText,
  BarChart3,
  Users,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Kelola Data Dosen STMIK Bandung (Admin Only)
 * Mendukung CRUD Lengkap, Searching, Filtering Kuota/Status, Pagination,
 * Reset Password (Dosen123), Penetapan Wali, Total Perwalian, Rekap Penugasan, dan Export Excel/PDF.
 */
export const DosenListPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRekapModalOpen, setIsRekapModalOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [selectedMhsIds, setSelectedMhsIds] = useState([]);
  const [assignSearch, setAssignSearch] = useState('');

  // Fetch Dosen List
  const { data: dosenResponse, isLoading } = useQuery({
    queryKey: ['dosen', page, search],
    queryFn: () => dosenService.getDosen({ page, search, per_page: 10 }),
  });

  // Fetch All Dosen for Rekap
  const { data: allDosenResponse } = useQuery({
    queryKey: ['dosen-all-rekap'],
    queryFn: dosenService.getAllList,
  });

  // Fetch Mahasiswa untuk Assign
  const { data: mhsResponse } = useQuery({
    queryKey: ['mahasiswa-for-assign'],
    queryFn: () => mahasiswaService.getMahasiswa({ per_page: 200 }),
    enabled: isAssignModalOpen,
  });

  const dosenList = dosenResponse?.data || [];
  const meta = dosenResponse?.meta || {};
  const allDosenList = allDosenResponse?.data || [];
  const allMhsList = mhsResponse?.data || [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const openCreateModal = () => {
    setSelectedDosen(null);
    reset({
      nidn: '',
      nama_lengkap: '',
      jenis_kelamin: 'Laki-laki',
      gelar: 'M.T.',
      email: '',
      no_hp: '',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '1985-01-01',
      pendidikan_terakhir: 'S2 Magister Komputer',
      alamat: '',
      foto: '',
      kuota_bimbingan: 30,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (dosen) => {
    setSelectedDosen(dosen);
    setValue('nidn', dosen.nidn);
    setValue('nama_lengkap', dosen.nama_lengkap);
    setValue('jenis_kelamin', dosen.jenis_kelamin || 'Laki-laki');
    setValue('gelar', dosen.gelar);
    setValue('email', dosen.email);
    setValue('no_hp', dosen.no_hp || '');
    setValue('tempat_lahir', dosen.tempat_lahir || '');
    setValue('tanggal_lahir', dosen.tanggal_lahir ? dosen.tanggal_lahir.slice(0, 10) : '');
    setValue('pendidikan_terakhir', dosen.pendidikan_terakhir || '');
    setValue('alamat', dosen.alamat || '');
    setValue('foto', dosen.foto || '');
    setValue('kuota_bimbingan', dosen.kuota_bimbingan);
    setIsFormModalOpen(true);
  };

  const openAssignModal = (dosen) => {
    setSelectedDosen(dosen);
    // Otomatis tandai mahasiswa yang saat ini sudah dibimbing oleh dosen ini
    const currentlyAssigned = (dosen.mahasiswa_bimbingan || []).map((m) => m.id);
    setSelectedMhsIds(currentlyAssigned);
    setAssignSearch('');
    setIsAssignModalOpen(true);
  };

  // Mutation Save Dosen
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (selectedDosen) {
        return dosenService.updateDosen(selectedDosen.id, data);
      }
      return dosenService.createDosen(data);
    },
    onSuccess: async () => {
      toast.success(selectedDosen ? 'Data Dosen Wali diperbarui.' : 'Dosen Wali berhasil dibuat.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dosen'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen-all-list'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen-all-rekap'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.refetchQueries({ queryKey: ['dosen'] }),
      ]);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data dosen.');
    },
  });

  // Mutation Assign Dosen Wali
  const assignMutation = useMutation({
    mutationFn: () => dosenService.assignWali({ dosen_id: selectedDosen.id, mahasiswa_ids: selectedMhsIds }),
    onSuccess: async () => {
      toast.success(`Berhasil menugaskan ${selectedMhsIds.length} mahasiswa ke Dosen Wali ${selectedDosen.nama_lengkap}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dosen'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen-all-list'] }),
        queryClient.invalidateQueries({ queryKey: ['mahasiswa'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen-all-rekap'] }),
        queryClient.refetchQueries({ queryKey: ['dosen'] }),
      ]);
      setIsAssignModalOpen(false);
    },
    onError: (err) => {
      toast.error('Gagal menugaskan Dosen Wali.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dosenService.deleteDosen(id),
    onSuccess: async () => {
      toast.success('Dosen Wali berhasil dihapus.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dosen'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen-all-list'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen-all-rekap'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.refetchQueries({ queryKey: ['dosen'] }),
      ]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus dosen.');
    },
  });

  const handleDelete = (dosen) => {
    MySwal.fire({
      title: 'Hapus Dosen Wali?',
      text: `Apakah Anda yakin menghapus Dosen ${dosen.nama_lengkap}? Akun user terkait juga akan terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        deleteMutation.mutate(dosen.id);
      }
    });
  };

  // Reset Password Dosen Action (Reset ke Default Dosen123)
  const handleResetPassword = (dosen) => {
    MySwal.fire({
      title: 'Reset Password Dosen?',
      text: `Password akun ${dosen.nama_lengkap} (${dosen.nidn}) akan direset ke default: "Dosen123"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Reset Password',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await dosenService.resetPassword(dosen.id);
          toast.success(res.message || 'Password berhasil direset ke Dosen123');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Gagal mereset password.');
        }
      }
    });
  };

  // Export Excel Dosen
  const handleExportExcel = async () => {
    try {
      toast.info('Menyiapkan file Excel data dosen...');
      const allRes = await dosenService.getDosen({ per_page: 500, search });
      const list = allRes?.data || dosenList;
      const rows = [
        ['NIDN', 'Nama Lengkap & Gelar', 'Jenis Kelamin', 'Email', 'No. WhatsApp', 'Pendidikan Terakhir', 'Tempat/Tgl Lahir', 'Alamat', 'Mahasiswa Bimbingan', 'Total Perwalian', 'Kuota'],
        ...list.map((d) => [
          d.nidn,
          d.nama_lengkap,
          d.jenis_kelamin || 'Laki-laki',
          d.email,
          d.no_hp || '-',
          d.pendidikan_terakhir || '-',
          `${d.tempat_lahir || '-'}, ${d.tanggal_lahir ? d.tanggal_lahir.slice(0, 10) : '-'}`,
          d.alamat || '-',
          d.total_mahasiswa_bimbingan || 0,
          d.total_perwalian_count || 0,
          d.kuota_bimbingan,
        ]),
      ];
      exportToExcel(rows, 'Data_Dosen_Wali_STMIK_Bandung');
      toast.success(`Berhasil mengunduh ${list.length} data Dosen ke Excel.`);
    } catch (err) {
      toast.error('Gagal mengekspor data ke Excel.');
    }
  };

  // Export PDF Dosen
  const handleExportPDF = async () => {
    try {
      toast.info('Menyiapkan file PDF data dosen...');
      const allRes = await dosenService.getDosen({ per_page: 500, search });
      const list = allRes?.data || dosenList;
      const headers = ['No', 'NIDN', 'Nama Dosen & Gelar', 'Jenis Kelamin', 'Pendidikan Terakhir', 'Email Official', 'WhatsApp', 'Mhs Bimbingan', 'Total Perwalian'];
      const rows = list.map((d, idx) => [
        idx + 1,
        d.nidn,
        d.nama_lengkap,
        d.jenis_kelamin || 'Laki-laki',
        d.pendidikan_terakhir || '-',
        d.email,
        d.no_hp || '-',
        `${d.total_mahasiswa_bimbingan || 0} / ${d.kuota_bimbingan}`,
        `${d.total_perwalian_count || 0} Perwalian`,
      ]);
      exportToPDF(headers, rows, 'Laporan Data Dosen Pembimbing Akademik STMIK Bandung', 'Data_Dosen_STMIK_Bandung');
      toast.success(`Berhasil mengunduh ${list.length} data Dosen ke PDF.`);
    } catch (err) {
      toast.error('Gagal mengekspor data ke PDF.');
    }
  };

  // Filter Mahasiswa for Assign Modal
  const filteredMhsForAssign = allMhsList.filter((m) =>
    m.nama_lengkap.toLowerCase().includes(assignSearch.toLowerCase()) ||
    m.nim.toLowerCase().includes(assignSearch.toLowerCase()) ||
    m.prodi.toLowerCase().includes(assignSearch.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Dosen Pembimbing Akademik (Dosen Wali)"
        description="Kelola data Dosen Wali STMIK Bandung, monitoring kuota bimbingan mahasiswa perwalian, rekapitulasi persetujuan, dan export laporan."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button size="sm" icon={Plus} onClick={openCreateModal}>
              Tambah Dosen Baru
            </Button>
          </div>
        }
      />

      {/* Searching & Filter Bar */}
      <Card hover={false} className="mb-6">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Cari NIDN, Nama, atau Email Dosen..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Table Dosen Wali */}
      <Card hover={false}>
        {isLoading ? (
          <LoadingSpinner text="Memuat data Dosen Wali STMIK Bandung..." fullHeight />
        ) : dosenList.length === 0 ? (
          <EmptyState title="Data Dosen Kosong" description="Belum ada Dosen Wali terdaftar." />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Foto & Dosen</th>
                    <th className="p-3">NIDN</th>
                    <th className="p-3">Jenis Kelamin</th>
                    <th className="p-3">Pendidikan Terakhir</th>
                    <th className="p-3">Alamat</th>
                    <th className="p-3">Kontak</th>
                    <th className="p-3">Mhs Bimbingan</th>
                    <th className="p-3">Total Perwalian</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {dosenList.map((dosen) => (
                    <tr key={dosen.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={dosen.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dosen.nama_lengkap)}`}
                            alt={dosen.nama_lengkap}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{dosen.nama_lengkap}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{dosen.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-primary-600 dark:text-primary-400">{dosen.nidn}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dosen.jenis_kelamin === 'Perempuan'
                            ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/60'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                        }`}>
                          {dosen.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{dosen.pendidikan_terakhir || '-'}</td>
                      <td className="p-3 text-slate-500 max-w-xs truncate" title={dosen.alamat || '-'}>{dosen.alamat || '-'}</td>
                      <td className="p-3">{dosen.no_hp || '-'}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {dosen.total_mahasiswa_bimbingan ?? 0}
                        </span>{' '}
                        / {dosen.kuota_bimbingan} Mhs
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {dosen.total_perwalian_count ?? 0} Perwalian
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button size="sm" variant="outline" icon={UserCheck} title="Penugasan Wali Mahasiswa" onClick={() => openAssignModal(dosen)}>
                          Penugasan Wali
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Reset Password ke Dosen123"
                          className="text-amber-600 hover:text-amber-700"
                          onClick={() => handleResetPassword(dosen)}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Edit Dosen" onClick={() => openEditModal(dosen)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Hapus Dosen" className="text-rose-600 hover:text-rose-700" onClick={() => handleDelete(dosen)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Halaman {meta.current_page || 1} dari {meta.last_page || 1} (Total {meta.total || 0} Dosen)</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="outline" disabled={page >= (meta.last_page || 1)} onClick={() => setPage(p => p + 1)}>Selanjutnya</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form Dosen (Lengkap dengan Tempat/Tgl Lahir, Pendidikan Terakhir, Alamat, Foto) */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedDosen ? 'Edit Data Dosen Wali' : 'Tambah Dosen Wali Baru'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="NIDN Dosen" placeholder="0401018501" error={errors.nidn?.message} {...register('nidn', { required: 'NIDN wajib diisi' })} />
            <Input label="Nama Lengkap Beserta Gelar" placeholder="Dr. Irwan Setiawan, M.T." error={errors.nama_lengkap?.message} {...register('nama_lengkap', { required: 'Nama wajib diisi' })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Jenis Kelamin"
              options={[
                { value: 'Laki-laki', label: 'Laki-laki' },
                { value: 'Perempuan', label: 'Perempuan' },
              ]}
              {...register('jenis_kelamin')}
            />
            <Input label="Gelar Akademik" placeholder="M.T. / M.Kom. / Ph.D." {...register('gelar')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Pendidikan Terakhir" placeholder="S3 Doktor Ilmu Komputer / S2 Magister" {...register('pendidikan_terakhir')} />
            <Input label="Email Official" type="email" placeholder="dosen@stmikbandung.ac.id" error={errors.email?.message} {...register('email', { required: 'Email wajib diisi' })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Tempat Lahir" placeholder="Bandung" {...register('tempat_lahir')} />
            <Input label="Tanggal Lahir" type="date" {...register('tanggal_lahir')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="No. WhatsApp / Telepon" placeholder="081234567890" {...register('no_hp')} />
            <Input label="Kuota Maksimal Bimbingan" type="number" placeholder="30" {...register('kuota_bimbingan')} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input label="URL Foto / Avatar (Opsional)" placeholder="https://..." {...register('foto')} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Alamat Lengkap / Kantor
            </label>
            <textarea
              rows={2}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              placeholder="Jl. Cikutra No. 113, Kota Bandung..."
              {...register('alamat')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={saveMutation.isLoading}>Simpan Dosen</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Penugasan Mahasiswa Wali */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Penugasan Dosen Wali: ${selectedDosen?.nama_lengkap}`} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Kuota Bimbingan: {selectedMhsIds.length} / {selectedDosen?.kuota_bimbingan} Mahasiswa</p>
              <p className="text-slate-500">Centang mahasiswa yang ingin dibimbing oleh Dosen Wali ini.</p>
            </div>
            <span className="font-bold text-primary-600 dark:text-primary-400">
              {selectedMhsIds.length} Dipilih
            </span>
          </div>

          <Input
            icon={Search}
            placeholder="Cari mahasiswa berdasarkan NIM, Nama, atau Prodi..."
            value={assignSearch}
            onChange={(e) => setAssignSearch(e.target.value)}
          />

          <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
            {filteredMhsForAssign.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-4">Tidak ada mahasiswa yang cocok dengan pencarian.</p>
            ) : (
              filteredMhsForAssign.map((mhs) => {
                const isSelected = selectedMhsIds.includes(mhs.id);
                const isCurrentWali = mhs.dosen_wali_id === selectedDosen?.id;
                return (
                  <label
                    key={mhs.id}
                    className={`flex items-center justify-between text-xs p-2.5 rounded-xl cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-800 text-primary-900 dark:text-primary-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedMhsIds([...selectedMhsIds, mhs.id]);
                          else setSelectedMhsIds(selectedMhsIds.filter((id) => id !== mhs.id));
                        }}
                        className="rounded border-slate-400 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-bold">{mhs.nim} - {mhs.nama_lengkap}</p>
                        <p className="text-[11px] opacity-75">{mhs.prodi} • Angkatan {mhs.angkatan}</p>
                      </div>
                    </div>

                    <div className="text-right text-[11px]">
                      {isCurrentWali ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                          Asuhan Saat Ini
                        </span>
                      ) : mhs.dosen_wali?.nama_lengkap ? (
                        <span className="text-slate-400">
                          Wali: {mhs.dosen_wali.nama_lengkap.split(' ')[0]}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold">Belum Punya Wali</span>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Batal</Button>
            <Button onClick={() => assignMutation.mutate()} isLoading={assignMutation.isLoading}>Simpan Penugasan</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Rekap Penugasan Wali per Dosen */}
      <Modal isOpen={isRekapModalOpen} onClose={() => setIsRekapModalOpen(false)} title="Rekapitulasi Penugasan Dosen Wali" maxWidth="max-w-4xl">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Ringkasan seluruh Dosen Pembimbing Akademik STMIK Bandung, kuota bimbingan, mahasiswa asuhan, dan jumlah total perwalian:
          </p>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Dosen Pembimbing</th>
                  <th className="p-3">NIDN</th>
                  <th className="p-3">Pendidikan Terakhir</th>
                  <th className="p-3">Mahasiswa Bimbingan</th>
                  <th className="p-3">Jumlah Perwalian</th>
                  <th className="p-3">Status Kuota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {allDosenList.map((d, index) => {
                  const percent = Math.round(((d.mahasiswa_bimbingan_count || 0) / (d.kuota_bimbingan || 30)) * 100);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-semibold">{index + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{d.nama_lengkap}</td>
                      <td className="p-3 text-primary-600 font-semibold">{d.nidn}</td>
                      <td className="p-3">{d.pendidikan_terakhir || '-'}</td>
                      <td className="p-3 font-semibold">
                        {d.mahasiswa_bimbingan_count || 0} / {d.kuota_bimbingan} Mhs
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {d.perwalian_count || 0} Perwalian
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-28 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
                          <div
                            className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-primary-500'}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{percent}% Terisi</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsRekapModalOpen(false)}>Tutup</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
