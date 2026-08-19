import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mahasiswaService } from '../../services/mahasiswaService';
import { dosenService } from '../../services/dosenService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { exportToExcel, exportToPDF } from '../../utils/exportHelpers';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForm } from 'react-hook-form';
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Upload,
  Pencil,
  Trash2,
  Key,
  Copy,
  Download,
  Info,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Kelola Data Mahasiswa STMIK Bandung (Admin & Dosen)
 * Mendukung CRUD Lengkap, Searching, Filtering Prodi (2 Prodi), Pagination, Reset Password, Import Template, dan Export Excel/PDF.
 */
export const MahasiswaListPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [prodiFilter, setProdiFilter] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedMhs, setSelectedMhs] = useState(null);
  const [importJsonText, setImportJsonText] = useState('');

  // Fetch Data Mahasiswa (TanStack Query)
  const { data: mhsResponse, isLoading } = useQuery({
    queryKey: ['mahasiswa', page, search, prodiFilter],
    queryFn: () => mahasiswaService.getMahasiswa({ page, search, prodi: prodiFilter, per_page: 10 }),
  });

  // Fetch List Dosen Wali untuk Dropdown
  const { data: dosenListResponse } = useQuery({
    queryKey: ['dosen-all-list'],
    queryFn: dosenService.getAllList,
  });

  const mhsList = mhsResponse?.data || [];
  const meta = mhsResponse?.meta || {};
  const dosenOptions = (dosenListResponse?.data || []).map((d) => ({
    value: d.id,
    label: `${d.nama_lengkap} (Kuota: ${d.mahasiswa_bimbingan_count}/${d.kuota_bimbingan})`,
  }));

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const openCreateModal = () => {
    setSelectedMhs(null);
    reset({
      nim: '',
      nama_lengkap: '',
      prodi: 'Teknik Informatika',
      angkatan: new Date().getFullYear().toString(),
      dosen_wali_id: '',
      ipk_terakhir: '0.00',
      sks_lulus: '0',
      foto: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (mhs) => {
    setSelectedMhs(mhs);
    setValue('nim', mhs.nim);
    setValue('nama_lengkap', mhs.nama_lengkap);
    setValue('prodi', mhs.prodi);
    setValue('angkatan', mhs.angkatan);
    setValue('dosen_wali_id', mhs.dosen_wali_id || '');
    setValue('ipk_terakhir', mhs.ipk_terakhir);
    setValue('sks_lulus', mhs.sks_lulus);
    setValue('foto', mhs.foto || '');
    setIsFormModalOpen(true);
  };

  // Mutation Create/Update
  const saveMutation = useMutation({
    mutationFn: (formData) => {
      if (selectedMhs) {
        return mahasiswaService.updateMahasiswa(selectedMhs.id, formData);
      }
      return mahasiswaService.createMahasiswa(formData);
    },
    onSuccess: () => {
      toast.success(selectedMhs ? 'Data Mahasiswa berhasil diperbarui.' : 'Data Mahasiswa berhasil ditambahkan.');
      queryClient.invalidateQueries(['mahasiswa']);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
        'Gagal menyimpan data mahasiswa.';
      toast.error(errorMsg);
    },
  });

  // Mutation Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => mahasiswaService.deleteMahasiswa(id),
    onSuccess: () => {
      toast.success('Data Mahasiswa berhasil dihapus.');
      queryClient.invalidateQueries(['mahasiswa']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus data.');
    },
  });

  const handleDelete = (mhs) => {
    MySwal.fire({
      title: 'Hapus Data Mahasiswa?',
      text: `Apakah Anda yakin ingin menghapus data ${mhs.nama_lengkap} (${mhs.nim})? Akun user terkait juga akan terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Data',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl dark:bg-slate-900 dark:text-slate-100',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(mhs.id);
      }
    });
  };

  // Reset Password Action (Reset ke Default Mahasiswa123)
  const handleResetPassword = (mhs) => {
    MySwal.fire({
      title: 'Reset Password Mahasiswa?',
      text: `Password akun ${mhs.nama_lengkap} (${mhs.nim}) akan direset ke default: "Mahasiswa123"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Reset Password',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await mahasiswaService.resetPassword(mhs.id);
          toast.success(res.message || 'Password berhasil direset ke Mahasiswa123');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Gagal mereset password.');
        }
      }
    });
  };

  // Import Action
  const handleImportSubmit = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        toast.error('Data import harus berupa JSON Array [ { ... } ]');
        return;
      }
      const res = await mahasiswaService.importMahasiswa({ data: parsed });
      toast.success(res.message || 'Data mahasiswa berhasil diimpor.');
      queryClient.invalidateQueries(['mahasiswa']);
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err) {
      toast.error('Format data JSON tidak valid. Pastikan format JSON array sudah benar.');
    }
  };

  const copyTemplateJson = () => {
    const template = JSON.stringify(
      [
        {
          nim: '3200021',
          nama_lengkap: 'Siti Nurhaliza',
          prodi: 'Teknik Informatika',
          angkatan: '2023',
          ipk_terakhir: 3.65,
          sks_lulus: 48,
        },
        {
          nim: '3200022',
          nama_lengkap: 'Muhammad Rizki',
          prodi: 'Sistem Informasi',
          angkatan: '2023',
          ipk_terakhir: 3.45,
          sks_lulus: 48,
        },
      ],
      null,
      2
    );
    navigator.clipboard.writeText(template);
    toast.success('Format template JSON berhasil disalin ke clipboard!');
  };

  // Export Action (Seluruh Halaman Data ke Excel)
  const handleExportExcel = async () => {
    try {
      toast.info('Menyiapkan file Excel seluruh data...');
      const allDataRes = await mahasiswaService.getMahasiswa({ per_page: 1000, prodi: prodiFilter, search });
      const allMhs = allDataRes?.data || mhsList;
      const rows = [
        ['NIM', 'Nama Mahasiswa', 'Program Studi', 'Angkatan', 'Dosen Wali', 'IPK Terakhir', 'SKS Lulus'],
        ...allMhs.map((m) => [
          m.nim,
          m.nama_lengkap,
          m.prodi,
          m.angkatan,
          m.dosen_wali?.nama_lengkap || 'Belum Ditetapkan',
          m.ipk_terakhir,
          m.sks_lulus,
        ]),
      ];
      exportToExcel(rows, 'Data_Mahasiswa_STMIK_Bandung');
      toast.success(`Berhasil mengunduh ${allMhs.length} data Mahasiswa ke Excel.`);
    } catch (err) {
      toast.error('Gagal mengekspor data ke Excel.');
    }
  };

  // Export PDF Action (Seluruh Halaman Data)
  const handleExportPDF = async () => {
    try {
      toast.info('Menyiapkan file PDF data mahasiswa...');
      const allDataRes = await mahasiswaService.getMahasiswa({ per_page: 1000, prodi: prodiFilter, search });
      const allMhs = allDataRes?.data || mhsList;
      const headers = ['No', 'NIM', 'Nama Mahasiswa', 'Program Studi', 'Angkatan', 'Dosen Pembimbing Akademik', 'IPK', 'SKS'];
      const rows = allMhs.map((m, idx) => [
        idx + 1,
        m.nim,
        m.nama_lengkap,
        m.prodi,
        m.angkatan,
        m.dosen_wali?.nama_lengkap || 'Belum Ada',
        m.ipk_terakhir?.toFixed(2) || '0.00',
        `${m.sks_lulus || 0} SKS`,
      ]);
      exportToPDF(headers, rows, 'Laporan Data Mahasiswa STMIK Bandung', 'Data_Mahasiswa_STMIK_Bandung');
      toast.success(`Berhasil mengunduh ${allMhs.length} data Mahasiswa ke PDF.`);
    } catch (err) {
      toast.error('Gagal mengekspor data ke PDF.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Data Mahasiswa"
        description="Kelola biodata akademik mahasiswa STMIK Bandung (Teknik Informatika & Sistem Informasi), penetapan Dosen Wali, dan ekspor/impor data."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button variant="secondary" size="sm" icon={Upload} onClick={() => setIsImportModalOpen(true)}>
              Import Data
            </Button>
            <Button size="sm" icon={Plus} onClick={openCreateModal}>
              Tambah Mahasiswa
            </Button>
          </div>
        }
      />

      {/* Filter & Searching Bar */}
      <Card hover={false} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Cari berdasarkan NIM atau Nama..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-60">
            <Select
              placeholder="Semua Program Studi"
              value={prodiFilter}
              onChange={(e) => {
                setProdiFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Semua Program Studi (2 Prodi)' },
                { value: 'Teknik Informatika', label: 'Teknik Informatika' },
                { value: 'Sistem Informasi', label: 'Sistem Informasi' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table Data Mahasiswa */}
      <Card hover={false}>
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : mhsList.length === 0 ? (
          <EmptyState
            title="Data Mahasiswa Kosong"
            description="Tidak ada data mahasiswa yang cocok dengan kriteria pencarian Anda."
            action={
              <Button size="sm" icon={Plus} onClick={openCreateModal}>
                Tambah Mahasiswa Baru
              </Button>
            }
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Foto & Mahasiswa</th>
                    <th className="p-3">NIM</th>
                    <th className="p-3">Program Studi</th>
                    <th className="p-3">Angkatan</th>
                    <th className="p-3">Dosen Wali</th>
                    <th className="p-3">IPK</th>
                    <th className="p-3">SKS</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {mhsList.map((mhs) => (
                    <tr key={mhs.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={mhs.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mhs.nama_lengkap)}`}
                            alt={mhs.nama_lengkap}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{mhs.nama_lengkap}</p>
                            <span className="text-[10px] text-slate-400">{mhs.user?.email || `${mhs.nim}@student.stmikbandung.ac.id`}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-primary-600 dark:text-primary-400">{mhs.nim}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {mhs.prodi}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{mhs.angkatan}</td>
                      <td className="p-3 font-medium">
                        {mhs.dosen_wali?.nama_lengkap ? (
                          <span className="text-slate-900 dark:text-slate-100 font-semibold">{mhs.dosen_wali.nama_lengkap}</span>
                        ) : (
                          <span className="text-slate-400 italic">Belum Ditetapkan</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{mhs.ipk_terakhir}</td>
                      <td className="p-3">{mhs.sks_lulus} SKS</td>
                      <td className="p-3 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Reset Password ke Mahasiswa123"
                          className="text-amber-600 hover:text-amber-700"
                          onClick={() => handleResetPassword(mhs)}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Edit Mahasiswa" onClick={() => openEditModal(mhs)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Hapus Mahasiswa" className="text-rose-600 hover:text-rose-700" onClick={() => handleDelete(mhs)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Menampilkan Halaman <strong>{meta.current_page || 1}</strong> dari <strong>{meta.last_page || 1}</strong> (Total {meta.total || 0} Mahasiswa)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (meta.last_page || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form Create/Edit Mahasiswa */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedMhs ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
      >
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <Input label="NIM Mahasiswa" placeholder="3200021" error={errors.nim?.message} {...register('nim', { required: 'NIM wajib diisi' })} />
          <Input label="Nama Lengkap" placeholder="Nama Mahasiswa Lengkap" error={errors.nama_lengkap?.message} {...register('nama_lengkap', { required: 'Nama wajib diisi' })} />
          
          {/* Program Studi strictly 2 options */}
          <Select
            label="Program Studi (Hanya 2 Program Studi)"
            options={[
              { value: 'Teknik Informatika', label: 'Teknik Informatika' },
              { value: 'Sistem Informasi', label: 'Sistem Informasi' },
            ]}
            {...register('prodi', { required: 'Program studi wajib dipilih' })}
          />

          <Input label="Tahun Angkatan" placeholder="2023" {...register('angkatan')} />
          <Select label="Dosen Wali Pembimbing" options={dosenOptions} placeholder="Pilih Dosen Wali..." {...register('dosen_wali_id')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="IPK Terakhir" type="number" step="0.01" placeholder="3.50" {...register('ipk_terakhir')} />
            <Input label="SKS Lulus" type="number" placeholder="48" {...register('sks_lulus')} />
          </div>

          <Input label="URL Foto / Avatar (Opsional)" placeholder="https://..." {...register('foto')} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saveMutation.isLoading}>
              Simpan Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Import Data Excel/JSON with Template Helper */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Mahasiswa Massal"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Info className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-bold">Apakah Impor Data Harus Menggunakan Template?</p>
              <p className="mt-0.5 text-blue-800 dark:text-blue-300">
                <strong>Ya</strong>, agar sistem dapat membaca data dan membuat akun user secara otomatis, format harus memiliki field standar: <code>nim</code>, <code>nama_lengkap</code>, <code>prodi</code> ("Teknik Informatika" / "Sistem Informasi"), dan <code>angkatan</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Contoh Format Template JSON:
            </span>
            <Button size="sm" variant="outline" icon={Copy} onClick={copyTemplateJson}>
              Salin Template JSON
            </Button>
          </div>

          <textarea
            rows={7}
            className="w-full text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            placeholder={`[\n  {\n    "nim": "3200021",\n    "nama_lengkap": "Siti Nurhaliza",\n    "prodi": "Teknik Informatika",\n    "angkatan": "2023",\n    "ipk_terakhir": 3.65,\n    "sks_lulus": 48\n  }\n]`}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleImportSubmit} icon={Upload}>
              Proses Impor Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
