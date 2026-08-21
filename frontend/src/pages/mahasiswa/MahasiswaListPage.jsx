import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mahasiswaService } from '../../services/mahasiswaService';
import { dosenService } from '../../services/dosenService';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { exportToExcel, exportToPDF, readExcelFile, downloadMahasiswaExcelTemplate } from '../../utils/exportHelpers';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForm, useWatch } from 'react-hook-form';
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
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Kelola Data Mahasiswa STMIK Bandung (Admin & Dosen)
 * Mendukung CRUD Lengkap, Searching, Filtering Prodi (2 Prodi), Pagination, Reset Password, Import Template, dan Export Excel/PDF.
 */
export const MahasiswaListPage = () => {
  const { user, hasRole } = useAuthStore();
  const isAdmin = hasRole('Admin');
  const isDosen = hasRole('Dosen');

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [prodiFilter, setProdiFilter] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedMhs, setSelectedMhs] = useState(null);
  
  // Import File Excel & JSON States
  const [activeImportTab, setActiveImportTab] = useState('excel');
  const [excelFile, setExcelFile] = useState(null);
  const [excelParsedData, setExcelParsedData] = useState([]);
  const [isReadingExcel, setIsReadingExcel] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const excelInputRef = React.useRef(null);

  // Auto-NIM Generator States
  const [suggestedNim, setSuggestedNim] = useState('');
  const [isCustomNim, setIsCustomNim] = useState(false);

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
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm();

  const watchedProdi = useWatch({ control, name: 'prodi', defaultValue: 'Teknik Informatika' });
  const watchedAngkatan = useWatch({ control, name: 'angkatan', defaultValue: new Date().getFullYear().toString() });
  const watchedNim = useWatch({ control, name: 'nim', defaultValue: '' });

  // Generate NIM Otomatis saat modal tambah terbuka atau Prodi & Angkatan berubah
  useEffect(() => {
    if (!isFormModalOpen || selectedMhs) return;

    const prodi = watchedProdi || 'Teknik Informatika';
    const angkatan = watchedAngkatan || new Date().getFullYear().toString();

    mahasiswaService.generateNim(prodi, angkatan)
      .then((res) => {
        if (res.success && res.data?.nim) {
          setSuggestedNim(res.data.nim);
          if (!isCustomNim) {
            setValue('nim', res.data.nim);
          }
        }
      })
      .catch(() => {
        const isIF = prodi.toLowerCase().includes('informatika');
        const prefix = isIF ? '12' : '32';
        const year2Digit = angkatan.replace(/\D/g, '').slice(-2) || String(new Date().getFullYear()).slice(-2);
        const fallbackNim = `${prefix}${year2Digit}001`;
        setSuggestedNim(fallbackNim);
        if (!isCustomNim) {
          setValue('nim', fallbackNim);
        }
      });
  }, [watchedProdi, watchedAngkatan, isFormModalOpen, selectedMhs, isCustomNim, setValue]);

  const openCreateModal = () => {
    setSelectedMhs(null);
    setIsCustomNim(false);
    const currentYear = new Date().getFullYear().toString();
    reset({
      nim: '',
      nama_lengkap: '',
      jenis_kelamin: 'Laki-laki',
      prodi: 'Teknik Informatika',
      angkatan: currentYear,
      dosen_wali_id: '',
      ipk_terakhir: '0.00',
      sks_lulus: '0',
      foto: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (mhs) => {
    setSelectedMhs(mhs);
    setIsCustomNim(true);
    setValue('nim', mhs.nim);
    setValue('nama_lengkap', mhs.nama_lengkap);
    setValue('jenis_kelamin', mhs.jenis_kelamin || 'Laki-laki');
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
    onSuccess: async () => {
      toast.success(selectedMhs ? 'Data Mahasiswa berhasil diperbarui.' : 'Data Mahasiswa & Akun Login berhasil dibuat!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mahasiswa'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.refetchQueries({ queryKey: ['mahasiswa'] }),
      ]);
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
    onSuccess: async () => {
      toast.success('Data Mahasiswa berhasil dihapus.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mahasiswa'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.refetchQueries({ queryKey: ['mahasiswa'] }),
      ]);
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

  // Handle pemilihan file Excel dari komputer
  const handleExcelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      toast.error('Format file tidak didukung. Harap pilih file dengan ekstensi .xlsx, .xls, atau .csv');
      return;
    }

    setExcelFile(file);
    setIsReadingExcel(true);
    try {
      const parsed = await readExcelFile(file);
      if (!parsed || parsed.length === 0) {
        toast.warning('Tidak ada baris data mahasiswa yang valid ditemukan di file Excel.');
        setExcelParsedData([]);
      } else {
        setExcelParsedData(parsed);
        toast.success(`Berhasil membaca ${parsed.length} baris data dari file ${file.name}`);
      }
    } catch (err) {
      toast.error('Gagal membaca file Excel. Pastikan format file tidak korup/rusak.');
      setExcelParsedData([]);
    } finally {
      setIsReadingExcel(false);
    }
  };

  const handleResetExcel = () => {
    setExcelFile(null);
    setExcelParsedData([]);
    if (excelInputRef.current) {
      excelInputRef.current.value = '';
    }
  };

  // Import Action dengan Proteksi Keamanan Data & Auto-NIM Generator
  const handleProcessImport = async () => {
    let payload = [];
    if (activeImportTab === 'excel') {
      if (!excelParsedData || excelParsedData.length === 0) {
        toast.error('Harap pilih file Excel yang memiliki data mahasiswa terlebih dahulu.');
        return;
      }
      payload = excelParsedData;
    } else {
      try {
        const parsed = JSON.parse(importJsonText);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          toast.error('Data import harus berupa JSON Array [ { ... } ] dan tidak boleh kosong.');
          return;
        }
        payload = parsed;
      } catch (err) {
        toast.error('Format data JSON tidak valid. Pastikan format JSON array sudah benar.');
        return;
      }
    }

    setIsImporting(true);
    try {
      const res = await mahasiswaService.importMahasiswa({ data: payload });
      toast.success(res.message || 'Data mahasiswa berhasil diproses.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mahasiswa'] }),
        queryClient.refetchQueries({ queryKey: ['mahasiswa'] }),
      ]);
      setIsImportModalOpen(false);
      handleResetExcel();
      setImportJsonText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses impor data.');
    } finally {
      setIsImporting(false);
    }
  };

  const copyTemplateJson = () => {
    const template = JSON.stringify(
      [
        {
          nama_lengkap: 'Rahmat Hidayat',
          jenis_kelamin: 'Laki-laki',
          prodi: 'Teknik Informatika',
          angkatan: '2026',
          ipk_terakhir: 3.65,
          sks_lulus: 48,
        },
        {
          nim: '3226001',
          nama_lengkap: 'Siti Nurhaliza',
          jenis_kelamin: 'Perempuan',
          prodi: 'Sistem Informasi',
          angkatan: '2026',
          ipk_terakhir: 3.75,
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
        ['NIM', 'Nama Mahasiswa', 'Jenis Kelamin', 'Program Studi', 'Angkatan', 'Dosen Wali', 'IPK Terakhir', 'SKS Lulus'],
        ...allMhs.map((m) => [
          m.nim,
          m.nama_lengkap,
          m.jenis_kelamin || 'Laki-laki',
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
      const headers = ['No', 'NIM', 'Nama Mahasiswa', 'Jenis Kelamin', 'Program Studi', 'Angkatan', 'Dosen Pembimbing Akademik', 'IPK', 'SKS'];
      const rows = allMhs.map((m, idx) => [
        idx + 1,
        m.nim,
        m.nama_lengkap,
        m.jenis_kelamin || 'Laki-laki',
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
        title={isDosen ? 'Mahasiswa Bimbingan Akademik' : 'Manajemen Data Mahasiswa'}
        description={
          isDosen
            ? 'Daftar mahasiswa asuhan di bawah perwalian dan bimbingan akademik Anda.'
            : 'Kelola biodata akademik mahasiswa STMIK Bandung (Teknik Informatika & Sistem Informasi), penetapan Dosen Wali, dan ekspor/impor data.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={handleExportPDF}>
              Export PDF
            </Button>
            {isAdmin && (
              <>
                <Button variant="secondary" size="sm" icon={Upload} onClick={() => setIsImportModalOpen(true)}>
                  Import Excel/JSON
                </Button>
                <Button size="sm" icon={Plus} onClick={openCreateModal}>
                  Tambah Mahasiswa
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <Card hover={false} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
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
          <LoadingSpinner text="Memuat data mahasiswa STMIK Bandung..." fullHeight />
        ) : mhsList.length === 0 ? (
          <EmptyState
            title={isDosen ? 'Belum Ada Mahasiswa Bimbingan' : 'Data Mahasiswa Kosong'}
            description={
              isDosen
                ? 'Belum ada mahasiswa asuhan yang ditugaskan di bawah bimbingan perwalian Anda.'
                : 'Tidak ada data mahasiswa yang cocok dengan kriteria pencarian Anda.'
            }
            action={
              isAdmin ? (
                <Button size="sm" icon={Plus} onClick={openCreateModal}>
                  Tambah Mahasiswa Baru
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
                    <th className="p-3">Foto & Mahasiswa</th>
                    <th className="p-3">NIM</th>
                    <th className="p-3">Jenis Kelamin</th>
                    <th className="p-3">Program Studi</th>
                    <th className="p-3">Angkatan</th>
                    {isAdmin && <th className="p-3">Dosen Wali</th>}
                    <th className="p-3">IPK</th>
                    <th className="p-3">SKS</th>
                    {isAdmin && <th className="p-3 text-right">Aksi</th>}
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
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{mhs.nama_lengkap}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <a
                                href={`mailto:${mhs.email || mhs.user?.email || `${mhs.nim}@student.stmikbandung.ac.id`}`}
                                className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 truncate max-w-[170px]"
                                title="Kirim Email"
                              >
                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{mhs.email || mhs.user?.email || `${mhs.nim}@student.stmikbandung.ac.id`}</span>
                              </a>
                              {(mhs.no_hp || mhs.user?.phone_number) && (
                                <a
                                  href={`https://wa.me/${(mhs.no_hp || mhs.user?.phone_number).replace(/^0/, '62').replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                                  title="Chat WhatsApp"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  {mhs.no_hp || mhs.user?.phone_number}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-primary-600 dark:text-primary-400">{mhs.nim}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mhs.jenis_kelamin === 'Perempuan'
                            ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/60'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                        }`}>
                          {mhs.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {mhs.prodi}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{mhs.angkatan}</td>
                      {isAdmin && (
                        <td className="p-3 font-medium">
                          {mhs.dosen_wali?.nama_lengkap ? (
                            <span className="text-slate-900 dark:text-slate-100 font-semibold">{mhs.dosen_wali.nama_lengkap}</span>
                          ) : (
                            <span className="text-slate-400 italic">Belum Ditetapkan</span>
                          )}
                        </td>
                      )}
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{mhs.ipk_terakhir}</td>
                      <td className="p-3">{mhs.sks_lulus} SKS</td>
                      {isAdmin && (
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta.last_page > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  Menampilkan {mhsList.length} dari {meta.total} mahasiswa (Halaman {meta.current_page} dari {meta.last_page})
                </p>
                <div className="flex gap-2">
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
                    disabled={page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Nama Mahasiswa Lengkap"
              error={errors.nama_lengkap?.message}
              {...register('nama_lengkap', { required: 'Nama wajib diisi' })}
            />
            <Select
              label="Jenis Kelamin"
              options={[
                { value: 'Laki-laki', label: 'Laki-laki' },
                { value: 'Perempuan', label: 'Perempuan' },
              ]}
              {...register('jenis_kelamin')}
            />
          </div>
          
          {/* Program Studi strictly 2 options */}
          <Select
            label="Program Studi"
            options={[
              { value: 'Teknik Informatika', label: 'Teknik Informatika (Prefix: 12)' },
              { value: 'Sistem Informasi', label: 'Sistem Informasi (Prefix: 32)' },
            ]}
            {...register('prodi', { required: 'Program studi wajib dipilih' })}
          />

          <Input label="Tahun Angkatan" placeholder="2026" {...register('angkatan', { required: 'Tahun angkatan wajib diisi' })} />

          {/* NIM Section with Auto-Sequential Format STMIK Bandung */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wide text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Nomor Induk Mahasiswa (NIM)</span>
              </label>
              {!selectedMhs && (
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCustomNim;
                    setIsCustomNim(next);
                    if (!next && suggestedNim) {
                      setValue('nim', suggestedNim);
                    }
                  }}
                  className="text-[11px] font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 underline cursor-pointer"
                >
                  {isCustomNim ? 'Gunakan NIM Otomatis' : 'Ketik NIM Manual'}
                </button>
              )}
            </div>

            {!isCustomNim && !selectedMhs ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={suggestedNim || 'Membuat NIM...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-primary-300 dark:border-primary-700 bg-white dark:bg-slate-900 font-mono font-bold text-sm text-primary-600 dark:text-primary-300 cursor-not-allowed"
                />
                <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                  Otomatis
                </span>
              </div>
            ) : (
              <Input
                placeholder={`Contoh: ${(watchedProdi || '').includes('Informatika') ? '12' : '32'}${(watchedAngkatan || '').slice(-2) || '26'}001`}
                error={errors.nim?.message}
                {...register('nim', { required: 'NIM wajib diisi' })}
              />
            )}

            <p className="text-[10px] text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
              <strong>Format STMIK:</strong>{' '}
              {(watchedProdi || '').includes('Informatika') ? 'Teknik Informatika (12)' : 'Sistem Informasi (32)'} + Tahun Masuk ({(watchedAngkatan || '').slice(-2) || '26'}) + Nomor Urut (001 s/d 010, 099, 100) &rarr;{' '}
              <strong className="text-primary-700 dark:text-primary-300 font-mono">{suggestedNim || `${(watchedProdi || '').includes('Informatika') ? '12' : '32'}${(watchedAngkatan || '').slice(-2) || '26'}001`}</strong>
            </p>
          </div>
          <Select label="Dosen Wali Pembimbing" options={dosenOptions} placeholder="Pilih Dosen Wali..." {...register('dosen_wali_id')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="IPK Terakhir" type="number" step="0.01" placeholder="0.00" {...register('ipk_terakhir')} />
            <Input label="SKS Lulus" type="number" placeholder="48" {...register('sks_lulus')} />
          </div>

          <Input label="URL Foto / Avatar (Opsional)" placeholder="https://..." {...register('foto')} />

          {!selectedMhs && (
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-bold">Akun Login Pengguna Dibuat Otomatis</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Sistem otomatis membuat akun login dengan Email: <code className="font-mono font-bold bg-white/70 dark:bg-slate-900/60 px-1 py-0.5 rounded">{watchedNim || suggestedNim ? `${(watchedNim || suggestedNim).toLowerCase()}@student.stmikbandung.ac.id` : '[nim]@student.stmikbandung.ac.id'}</code> dan Password: <code className="font-mono font-bold bg-white/70 dark:bg-slate-900/60 px-1 py-0.5 rounded">Mahasiswa123</code>.
                </p>
              </div>
            </div>
          )}

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

      {/* Modal Import Data Excel/JSON with Template Helper & Preview */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          handleResetExcel();
        }}
        title="Import Data Mahasiswa Massal"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          {/* Informasi Proteksi Keamanan */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>Ketentuan & Proteksi Keamanan Impor Data</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              <li>
                <strong>NIM Bersifat Opsional:</strong> Jika kolom NIM kosong, sistem otomatis membuatkan NIM baru berurutan sesuai format standar STMIK (IF = 12, SI = 32).
              </li>
              <li>
                <strong>Proteksi Kesalahan Ketik NIM:</strong> Jika NIM yang diimpor sudah terdaftar atas nama orang lain, sistem <strong>tidak akan menimpa</strong> data tersebut (baris dilewati demi keamanan).
              </li>
              <li>
                <strong>Akun Login Otomatis:</strong> Mahasiswa baru yang berhasil diimpor langsung dibuatkan akun login dengan default password <code>Mahasiswa123</code>.
              </li>
            </ul>
          </div>

          {/* Tab Pilihan Metode Impor: File Excel atau JSON */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
            <button
              type="button"
              onClick={() => setActiveImportTab('excel')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeImportTab === 'excel'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Unggah File Excel (.xlsx / .csv)
            </button>
            <button
              type="button"
              onClick={() => setActiveImportTab('json')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeImportTab === 'json'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Format JSON Array
            </button>
          </div>

          {/* TAB 1: UNGGAH FILE EXCEL */}
          {activeImportTab === 'excel' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih atau Tarik File Excel ke area di bawah:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Download}
                  onClick={downloadMahasiswaExcelTemplate}
                  className="text-xs text-primary-600 dark:text-primary-400 border-primary-300"
                >
                  Unduh Template Excel (.xlsx)
                </Button>
              </div>

              {/* Area Upload File */}
              <div
                onClick={() => excelInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
                  excelFile
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-primary-500 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <input
                  type="file"
                  ref={excelInputRef}
                  onChange={handleExcelFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                {isReadingExcel ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <LoadingSpinner text="Membaca dan memproses file Excel..." />
                  </div>
                ) : excelFile ? (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      File Dipilih: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {excelParsedData.length} baris data mahasiswa siap diproses
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetExcel();
                      }}
                      className="mt-1 text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Ganti File Lain
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                    <Upload className="w-8 h-8 text-primary-500 mb-1" />
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Klik untuk memilih file Excel dari perangkat Anda
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Mendukung format file: <code>.xlsx</code>, <code>.xls</code>, atau <code>.csv</code>
                    </p>
                  </div>
                )}
              </div>

              {/* Preview Tabel Hasil Pembacaan Excel */}
              {excelParsedData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Preview Data Excel ({excelParsedData.length} Mahasiswa):
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Hanya menampilkan hingga 5 baris awal preview
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-48">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">No</th>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">Jenis Kelamin</th>
                          <th className="p-2">Program Studi</th>
                          <th className="p-2">Angkatan</th>
                          <th className="p-2">NIM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {excelParsedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-2 text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900 dark:text-slate-100">{row.nama_lengkap}</td>
                            <td className="p-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {row.jenis_kelamin || 'Laki-laki'}
                              </span>
                            </td>
                            <td className="p-2 text-slate-700 dark:text-slate-300">{row.prodi}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">{row.angkatan}</td>
                            <td className="p-2 font-mono">
                              {row.nim ? (
                                <span className="font-bold text-primary-600 dark:text-primary-400">{row.nim}</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                  Otomatis STMIK
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEMPEL JSON ARRAY */}
          {activeImportTab === 'json' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Format Data JSON (Array):
                </span>
                <Button size="sm" variant="outline" icon={Copy} onClick={copyTemplateJson}>
                  Salin Format Template
                </Button>
              </div>

              <textarea
                rows={8}
                className="w-full text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                placeholder={`[\n  {\n    "nama_lengkap": "Rahmat Hidayat",\n    "jenis_kelamin": "Laki-laki",\n    "prodi": "Teknik Informatika",\n    "angkatan": "2026",\n    "ipk_terakhir": 3.65,\n    "sks_lulus": 48\n  },\n  {\n    "nim": "3226001",\n    "nama_lengkap": "Siti Nurhaliza",\n    "jenis_kelamin": "Perempuan",\n    "prodi": "Sistem Informasi",\n    "angkatan": "2026"\n  }\n]`}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
              />
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportModalOpen(false);
                handleResetExcel();
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleProcessImport}
              icon={Upload}
              isLoading={isImporting}
              disabled={activeImportTab === 'excel' && excelParsedData.length === 0}
            >
              Proses Impor Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
