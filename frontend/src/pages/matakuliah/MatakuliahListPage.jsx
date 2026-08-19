import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matakuliahService } from '../../services/matakuliahService';
import { dosenService } from '../../services/dosenService';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForm, useWatch } from 'react-hook-form';
import {
  Plus,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Search,
  Sparkles,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

// Daftar Ruangan Perkuliahan Standar Kampus STMIK Bandung
const RUANGAN_OPTIONS = [
  { value: 'Lab IF-1', label: 'Lab IF-1 (Gedung A Lt. 2)' },
  { value: 'Lab IF-2', label: 'Lab IF-2 (Gedung A Lt. 2)' },
  { value: 'Lab Multimedia', label: 'Lab Multimedia (Gedung B Lt. 1)' },
  { value: 'Lab Jaringan & Robotika', label: 'Lab Jaringan & Robotika (Gedung B Lt. 2)' },
  { value: 'Ruang 101', label: 'Ruang 101 (Teori - Gedung A Lt. 1)' },
  { value: 'Ruang 102', label: 'Ruang 102 (Teori - Gedung A Lt. 1)' },
  { value: 'Ruang 103', label: 'Ruang 103 (Teori - Gedung A Lt. 1)' },
  { value: 'Ruang 201', label: 'Ruang 201 (Teori - Gedung A Lt. 2)' },
  { value: 'Ruang 202', label: 'Ruang 202 (Teori - Gedung A Lt. 2)' },
  { value: 'Ruang 203', label: 'Ruang 203 (Teori - Gedung A Lt. 2)' },
  { value: 'Ruang 301', label: 'Ruang 301 (Teori - Gedung A Lt. 3)' },
  { value: 'Ruang 302', label: 'Ruang 302 (Teori - Gedung A Lt. 3)' },
  { value: 'Aula Utama', label: 'Aula Utama STMIK Bandung' },
  { value: 'Online (Zoom/GMeet)', label: 'Online Perkuliahan (Zoom / GMeet)' },
];

// Sesi Jam Perkuliahan Standar Kampus
const SESI_JAM_OPTIONS = [
  { value: '08:00 - 10:30', label: '08:00 - 10:30 (Pagi Sesi 1)' },
  { value: '07:30 - 10:00', label: '07:30 - 10:00 (Pagi Sesi Awal)' },
  { value: '10:30 - 13:00', label: '10:30 - 13:00 (Siang Sesi 2)' },
  { value: '13:30 - 16:00', label: '13:30 - 16:00 (Sore Sesi 3)' },
  { value: '16:30 - 19:00', label: '16:30 - 19:00 (Sore/Malam Sesi 4)' },
  { value: '18:30 - 21:00', label: '18:30 - 21:00 (Kelas Karyawan Malam)' },
];

/**
 * Halaman Manajemen Mata Kuliah & Jadwal Perkuliahan STMIK Bandung
 * Database-backed: CRUD untuk Admin dengan Auto-Generate Kode Matkul & Dropdown Ruangan.
 */
export const MatakuliahListPage = () => {
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [prodiFilter, setProdiFilter] = useState('');
  const [hariFilter, setHariFilter] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedMatkul, setSelectedMatkul] = useState(null);
  const [isManualKode, setIsManualKode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  // Watch prodi & semester untuk kalkulasi otomatis kode matkul berikutnya
  const watchedProdi = useWatch({ control, name: 'prodi', defaultValue: 'Teknik Informatika' });
  const watchedSemester = useWatch({ control, name: 'semester', defaultValue: 1 });

  // 1. Ambil data list matakuliah terpaginasi
  const { data: matkulResponse, isLoading } = useQuery({
    queryKey: ['matakuliah', page, search, semesterFilter, prodiFilter, hariFilter],
    queryFn: () =>
      matakuliahService.getMatakuliah({
        page,
        search,
        semester: semesterFilter,
        prodi: prodiFilter,
        hari: hariFilter,
        per_page: 15,
      }),
  });

  // 2. Ambil seluruh matakuliah dari database untuk kalkulasi kode terakhir
  const { data: allMatkulRes } = useQuery({
    queryKey: ['matakuliah-all'],
    queryFn: () => matakuliahService.getMatakuliah({ all: true }),
  });
  const allMatkul = allMatkulRes?.data || [];

  // 3. Ambil daftar dosen untuk saran pengampu (realtime dari master dosen)
  const { data: allDosenRes } = useQuery({
    queryKey: ['dosen-all-list'],
    queryFn: () => dosenService.getAllList(),
    staleTime: 0,
  });
  const dosenList = allDosenRes?.data || [];

  // Gabungkan seluruh dosen dari master dosen dan riwayat dosen di matakuliah
  const uniqueDosenOptions = useMemo(() => {
    const names = new Set();
    const result = [];

    // Dari database Master Dosen STMIK Bandung
    dosenList.forEach((d) => {
      const fullTitle = `${d.nama_lengkap}${d.gelar ? ', ' + d.gelar : ''}`;
      if (fullTitle && !names.has(fullTitle)) {
        names.add(fullTitle);
        result.push({
          id: `dosen-${d.id}`,
          value: fullTitle,
          label: `${fullTitle} (NIDN: ${d.nidn})`,
        });
      }
    });

    // Dari nama dosen yang pernah tercatat di matakuliah
    allMatkul.forEach((m, idx) => {
      if (m.dosen_pengampu && !names.has(m.dosen_pengampu)) {
        names.add(m.dosen_pengampu);
        result.push({
          id: `mk-${idx}`,
          value: m.dosen_pengampu,
          label: `${m.dosen_pengampu} (Pengampu)`,
        });
      }
    });

    return result;
  }, [dosenList, allMatkul]);

  const matkulList = matkulResponse?.data || [];
  const meta = matkulResponse?.meta || {};

  // Kalkulasi kode matkul sequential berikutnya berdasarkan Prodi & Semester
  const kodeOptions = useMemo(() => {
    let prefix = 'IF';
    if (watchedProdi === 'Sistem Informasi') prefix = 'SI';
    else if (watchedProdi === 'Umum') prefix = 'MKU';

    const sem = Number(watchedSemester) || 1;
    const baseNumber = sem * 100; // Misal Sem 1: 100, Sem 3: 300, Sem 4: 400

    // Cari seluruh kode matkul yang sudah ada di database untuk prefix & semester ini
    const matchingCodes = allMatkul
      .filter((m) => {
        if (!m.kode) return false;
        const normalized = m.kode.toUpperCase().replace(/\s+/g, '');
        return (
          normalized.startsWith(`${prefix}-${sem}`) ||
          normalized.startsWith(`${prefix}${sem}`)
        );
      })
      .map((m) => {
        // Ambil angka dari kode, contoh IF-303 -> 303
        const numMatch = m.kode.match(/\d+/);
        return numMatch ? parseInt(numMatch[0], 10) : 0;
      })
      .filter((n) => n >= baseNumber && n < baseNumber + 100);

    const maxNum = matchingCodes.length > 0 ? Math.max(...matchingCodes) : baseNumber;
    const nextSeqNum = maxNum === baseNumber ? baseNumber + 1 : maxNum + 1;

    const options = [];

    // Opsi Kode yang sedang diedit (jika mode edit)
    if (selectedMatkul?.kode) {
      options.push({
        value: selectedMatkul.kode,
        label: `${selectedMatkul.kode} (Kode Saat Ini)`,
      });
    }

    // Opsi Kode Rekomendasi Berikutnya (misal IF-304)
    const nextCode = `${prefix}-${nextSeqNum}`;
    if (!options.some((o) => o.value === nextCode)) {
      options.push({
        value: nextCode,
        label: `${nextCode} ★ (Otomatis Berikutnya)`,
      });
    }

    // Opsi Kode Berurutan Tambahan (+1 s/d +5)
    for (let i = 1; i <= 5; i++) {
      const seqCode = `${prefix}-${nextSeqNum + i}`;
      if (!options.some((o) => o.value === seqCode)) {
        options.push({
          value: seqCode,
          label: `${seqCode}`,
        });
      }
    }

    options.push({ value: '__MANUAL__', label: '✏️ Ketik Kode Kustom Manual...' });

    return options;
  }, [allMatkul, watchedProdi, watchedSemester, selectedMatkul]);

  // Otomatis update nilai 'kode' saat prodi/semester berganti pada modal tambah baru
  useEffect(() => {
    if (!selectedMatkul && isFormModalOpen && !isManualKode && kodeOptions.length > 0) {
      const defaultOption = kodeOptions[0]?.value;
      if (defaultOption && defaultOption !== '__MANUAL__') {
        setValue('kode', defaultOption);
      }
    }
  }, [kodeOptions, selectedMatkul, isFormModalOpen, isManualKode, setValue]);

  const openCreateModal = () => {
    setSelectedMatkul(null);
    setIsManualKode(false);
    reset({
      kode: '',
      nama: '',
      sks: 3,
      semester: 1,
      prodi: 'Teknik Informatika',
      hari: 'Senin',
      jam_mulai: '08:00',
      jam_selesai: '10:30',
      ruangan: 'Lab IF-1',
      dosen_pengampu: '',
      kuota: 40,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedMatkul(item);
    setIsManualKode(false);
    setValue('kode', item.kode);
    setValue('nama', item.nama);
    setValue('sks', item.sks);
    setValue('semester', item.semester);
    setValue('prodi', item.prodi);
    setValue('hari', item.hari);
    setValue('jam_mulai', item.jam_mulai);
    setValue('jam_selesai', item.jam_selesai);
    setValue('ruangan', item.ruangan);
    setValue('dosen_pengampu', item.dosen_pengampu || '');
    setValue('kuota', item.kuota || 40);
    setIsFormModalOpen(true);
  };

  const handleSesiJamChange = (val) => {
    if (!val) return;
    const [start, end] = val.split(' - ');
    if (start && end) {
      setValue('jam_mulai', start.trim());
      setValue('jam_selesai', end.trim());
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (selectedMatkul) {
        return matakuliahService.updateMatakuliah(selectedMatkul.id, data);
      }
      return matakuliahService.createMatakuliah(data);
    },
    onSuccess: () => {
      toast.success(selectedMatkul ? 'Mata kuliah berhasil diperbarui!' : 'Mata kuliah baru berhasil disimpan ke database!');
      queryClient.invalidateQueries(['matakuliah']);
      queryClient.invalidateQueries(['matakuliah-all']);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
        'Gagal menyimpan data mata kuliah.';
      toast.error(errorMsg);
    },
  });

  const handleDelete = (item) => {
    MySwal.fire({
      title: 'Hapus Mata Kuliah?',
      text: `Apakah Anda yakin ingin menghapus [${item.kode}] ${item.nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        matakuliahService.deleteMatakuliah(item.id).then(() => {
          toast.success('Mata kuliah berhasil dihapus dari database.');
          queryClient.invalidateQueries(['matakuliah']);
          queryClient.invalidateQueries(['matakuliah-all']);
        });
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Mata Kuliah & Jadwal Kuliah"
        description="Database kurikulum resmi STMIK Bandung Semester 1 - 8 lengkap dengan jadwal hari, jam perkuliahan, ruangan, dan dosen pengampu."
        actions={
          hasRole('Admin') ? (
            <Button icon={Plus} onClick={openCreateModal}>
              Tambah Mata Kuliah
            </Button>
          ) : null
        }
      />

      {/* Filter & Search Bar */}
      <Card hover={false} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <Input
              icon={Search}
              placeholder="Cari kode / nama matkul..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            placeholder="Semua Semester"
            value={semesterFilter}
            onChange={(e) => {
              setSemesterFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Semester (1 - 8)' },
              { value: '1', label: 'Semester 1' },
              { value: '2', label: 'Semester 2' },
              { value: '3', label: 'Semester 3' },
              { value: '4', label: 'Semester 4' },
              { value: '5', label: 'Semester 5' },
              { value: '6', label: 'Semester 6' },
              { value: '7', label: 'Semester 7' },
              { value: '8', label: 'Semester 8' },
            ]}
          />
          <Select
            placeholder="Semua Program Studi"
            value={prodiFilter}
            onChange={(e) => {
              setProdiFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Prodi & Umum' },
              { value: 'Teknik Informatika', label: 'Teknik Informatika' },
              { value: 'Sistem Informasi', label: 'Sistem Informasi' },
              { value: 'Umum', label: 'Mata Kuliah Umum' },
            ]}
          />
          <Select
            placeholder="Semua Hari"
            value={hariFilter}
            onChange={(e) => {
              setHariFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Hari' },
              { value: 'Senin', label: 'Senin' },
              { value: 'Selasa', label: 'Selasa' },
              { value: 'Rabu', label: 'Rabu' },
              { value: 'Kamis', label: 'Kamis' },
              { value: 'Jumat', label: 'Jumat' },
              { value: 'Sabtu', label: 'Sabtu' },
            ]}
          />
        </div>
      </Card>

      {/* Table Matakuliah & Jadwal */}
      <Card hover={false}>
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : matkulList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Mata Kuliah"
            description="Belum ada data mata kuliah yang sesuai dengan filter."
            action={hasRole('Admin') ? <Button icon={Plus} onClick={openCreateModal}>Tambah Mata Kuliah</Button> : null}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Kode & Mata Kuliah</th>
                    <th className="p-3">Program Studi</th>
                    <th className="p-3">SKS</th>
                    <th className="p-3">Jadwal (Hari & Jam)</th>
                    <th className="p-3">Ruangan</th>
                    <th className="p-3">Dosen Pengampu</th>
                    {hasRole('Admin') && <th className="p-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {matkulList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-800">
                          Sem {item.semester}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        <span className="font-mono text-primary-600 dark:text-primary-400 font-bold mr-1.5">[{item.kode}]</span>
                        {item.nama}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.prodi === 'Teknik Informatika'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : item.prodi === 'Sistem Informasi'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }`}>
                          {item.prodi}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{item.sks} SKS</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-primary-500" />
                          {item.hari}, {item.jam_mulai} - {item.jam_selesai}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.ruangan}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                        {item.dosen_pengampu || '-'}
                      </td>
                      {hasRole('Admin') && (
                        <td className="p-3 text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(item)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700" onClick={() => handleDelete(item)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Halaman {meta.current_page || 1} dari {meta.last_page || 1} (Total {meta.total || 0} Mata Kuliah)</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="outline" disabled={page >= (meta.last_page || 1)} onClick={() => setPage((p) => p + 1)}>Selanjutnya</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Tambah/Edit Matakuliah dengan Dropdown Cerdas */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedMatkul ? 'Edit Data Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          {/* Baris 1: Prodi & Semester Terlebih Dahulu untuk Menentukan Kode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <Select
              label="Program Studi"
              options={[
                { value: 'Teknik Informatika', label: 'Teknik Informatika (Prefix: IF-)' },
                { value: 'Sistem Informasi', label: 'Sistem Informasi (Prefix: SI-)' },
                { value: 'Umum', label: 'Mata Kuliah Umum (Prefix: MKU-)' },
              ]}
              {...register('prodi', { required: 'Program studi wajib dipilih' })}
            />
            <Select
              label="Semester"
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                value: s,
                label: `Semester ${s} (Format: ${s}01, ${s}02...)`,
              }))}
              {...register('semester', { required: 'Semester wajib dipilih', valueAsNumber: true })}
            />
          </div>

          {/* Baris 2: Kode Matkul (Dropdown Auto-Sequential) & Nama Matkul */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                  Kode Mata Kuliah
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualKode(!isManualKode)}
                  className="text-[10px] text-primary-600 dark:text-primary-400 font-bold hover:underline"
                >
                  {isManualKode ? 'Gunakan Dropdown' : 'Ketik Manual'}
                </button>
              </div>

              {isManualKode ? (
                <Input
                  placeholder="Contoh: IF-304 / SI-401"
                  error={errors.kode?.message}
                  {...register('kode', { required: 'Kode matkul wajib diisi' })}
                />
              ) : (
                <Select
                  options={kodeOptions}
                  error={errors.kode?.message}
                  {...register('kode', {
                    required: 'Kode matkul wajib dipilih',
                    onChange: (e) => {
                      if (e.target.value === '__MANUAL__') {
                        setIsManualKode(true);
                        setValue('kode', '');
                      }
                    },
                  })}
                />
              )}
            </div>

            <Input
              label="Nama Mata Kuliah"
              placeholder="Contoh: Kecerdasan Buatan"
              error={errors.nama?.message}
              {...register('nama', { required: 'Nama mata kuliah wajib diisi' })}
            />
          </div>

          {/* Baris 3: Bobot SKS & Kuota Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Bobot SKS"
              options={[
                { value: 1, label: '1 SKS (Praktikum Ringan)' },
                { value: 2, label: '2 SKS (Teori / Praktikum Standar)' },
                { value: 3, label: '3 SKS (Teori & Praktikum Reguler)' },
                { value: 4, label: '4 SKS (Mata Kuliah Inti / Studio)' },
                { value: 6, label: '6 SKS (Tugas Akhir / Skripsi)' },
              ]}
              {...register('sks', { required: 'SKS wajib dipilih', valueAsNumber: true })}
            />

            <Input
              label="Kuota Mahasiswa"
              type="number"
              min="10"
              max="100"
              placeholder="40"
              {...register('kuota', { valueAsNumber: true })}
            />
          </div>

          {/* Baris 4: Jadwal Hari & Jam (Preset Dropdown) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Hari Perkuliahan"
              options={['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((h) => ({
                value: h,
                label: h,
              }))}
              {...register('hari', { required: 'Hari wajib dipilih' })}
            />
            <Input
              label="Jam Mulai"
              type="time"
              placeholder="08:00"
              {...register('jam_mulai', { required: 'Jam mulai wajib diisi' })}
            />
            <Input
              label="Jam Selesai"
              type="time"
              placeholder="10:30"
              {...register('jam_selesai', { required: 'Jam selesai wajib diisi' })}
            />
          </div>

          {/* Shortcut Pilihan Jam Standar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary-500" />
              Preset Jam:
            </span>
            {SESI_JAM_OPTIONS.map((sesi) => (
              <button
                key={sesi.value}
                type="button"
                onClick={() => handleSesiJamChange(sesi.value)}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {sesi.value}
              </button>
            ))}
          </div>

          {/* Baris 5: Ruangan Dropdown & Dosen Pengampu Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Ruangan Perkuliahan "
              options={RUANGAN_OPTIONS}
              {...register('ruangan', { required: 'Ruangan wajib dipilih' })}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                Dosen Pengampu (Bebas Ketik Nama Dosen)
              </label>
              <input
                list="dosen-suggestions"
                type="text"
                placeholder="Contoh: Dr. Irwan Setiawan, M.T. / Dosen Baru..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-slate-400"
                {...register('dosen_pengampu')}
              />
              <datalist id="dosen-suggestions">
                {uniqueDosenOptions.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saveMutation.isLoading}>
              Simpan Mata Kuliah
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
