import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
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
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForm, useWatch } from 'react-hook-form';
import { Plus, ShieldCheck, Pencil, Trash2, Search, Key, UserCheck, GraduationCap, Users, Sparkles } from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Kelola User & Role Spatie (Admin Only)
 * Mendukung input dinamis NIM, Program Studi, Angkatan, serta Penugasan Langsung Dosen Wali (untuk Mahasiswa).
 */
export const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Auto-NIM Generator States
  const [suggestedNim, setSuggestedNim] = useState('');
  const [isCustomNim, setIsCustomNim] = useState(false);
  const [isCustomEmail, setIsCustomEmail] = useState(false);

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () => userService.getUsers({ page, search, role: roleFilter, per_page: 10 }),
  });

  const { data: rolesResponse } = useQuery({
    queryKey: ['roles'],
    queryFn: userService.getRoles,
  });

  // Query Daftar Seluruh Dosen untuk Dropdown Dosen Wali
  const { data: allDosenRes } = useQuery({
    queryKey: ['dosen-all-list'],
    queryFn: () => dosenService.getAllList(),
  });
  const dosenList = allDosenRes?.data || [];

  const usersList = usersResponse?.data || [];
  const meta = usersResponse?.meta || {};
  const rolesList = (rolesResponse?.data || []).map((r) => ({ value: r.name, label: r.name }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  // Watch perubahan role secara realtime untuk memunculkan field NIM / NIDN / Dosen Wali
  const watchedRole = useWatch({ control, name: 'role', defaultValue: 'Mahasiswa' });
  const watchedProdi = useWatch({ control, name: 'prodi', defaultValue: 'Teknik Informatika' });
  const watchedAngkatan = useWatch({ control, name: 'angkatan', defaultValue: new Date().getFullYear().toString() });
  const watchedNim = useWatch({ control, name: 'nim', defaultValue: '' });

  // Generate NIM Otomatis saat modal tambah terbuka atau Prodi & Angkatan berubah
  useEffect(() => {
    if (!isFormModalOpen || selectedUser || watchedRole !== 'Mahasiswa') return;

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
  }, [watchedProdi, watchedAngkatan, watchedRole, isFormModalOpen, selectedUser, isCustomNim, setValue]);

  // Otomatis sinkronkan email default mahasiswa [nim]@student.stmikbandung.ac.id
  useEffect(() => {
    if (!isFormModalOpen || selectedUser) return;

    if (watchedRole === 'Mahasiswa' && !isCustomEmail) {
      const activeNim = watchedNim || suggestedNim;
      if (activeNim) {
        setValue('email', `${activeNim.toLowerCase()}@student.stmikbandung.ac.id`);
      }
    }
  }, [watchedNim, suggestedNim, watchedRole, isCustomEmail, isFormModalOpen, selectedUser, setValue]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsCustomNim(false);
    setIsCustomEmail(false);
    const currentYear = new Date().getFullYear().toString();
    reset({
      name: '',
      email: '',
      password: '',
      role: 'Mahasiswa',
      jenis_kelamin: 'Laki-laki',
      nim: '',
      prodi: 'Teknik Informatika',
      angkatan: currentYear,
      dosen_wali_id: '',
      nidn: '',
      gelar: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsCustomNim(true);
    setIsCustomEmail(true);
    const userRole = user.roles?.[0] || 'Mahasiswa';
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', userRole);
    setValue('jenis_kelamin', user.mahasiswa?.jenis_kelamin || user.dosen?.jenis_kelamin || 'Laki-laki');
    setValue('nim', user.mahasiswa?.nim || '');
    setValue('prodi', user.mahasiswa?.prodi || 'Teknik Informatika');
    setValue('angkatan', user.mahasiswa?.angkatan || '2024');
    setValue('dosen_wali_id', user.mahasiswa?.dosen_wali_id || '');
    setValue('nidn', user.dosen?.nidn || '');
    setValue('gelar', user.dosen?.gelar || '');
    setIsFormModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      const payload = { ...formData };

      // Password default otomatis jika kosong
      if (!payload.password) {
        payload.password = payload.role === 'Mahasiswa' ? 'Mahasiswa123' : (payload.role === 'Dosen' ? 'Dosen123' : 'Admin123');
      }

      // Email default untuk mahasiswa otomatis jika kosong
      if (!payload.email && payload.role === 'Mahasiswa') {
        const nimVal = payload.nim || watchedNim || suggestedNim;
        if (nimVal) {
          payload.email = `${nimVal.toLowerCase()}@student.stmikbandung.ac.id`;
        }
      }

      if (selectedUser) {
        return userService.updateUser(selectedUser.id, payload);
      }
      return userService.createUser(payload);
    },
    onSuccess: async () => {
      toast.success(selectedUser ? 'Data Pengguna diperbarui.' : 'Pengguna baru berhasil ditambahkan.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['mahasiswa'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen-all-list'] }),
        queryClient.refetchQueries({ queryKey: ['users'] }),
      ]);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
        'Gagal menyimpan pengguna.';
      toast.error(errorMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: async () => {
      toast.success('Pengguna berhasil dihapus.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['mahasiswa'] }),
        queryClient.invalidateQueries({ queryKey: ['dosen'] }),
        queryClient.refetchQueries({ queryKey: ['users'] }),
      ]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus pengguna.');
    },
  });

  const handleDelete = (user) => {
    MySwal.fire({
      title: 'Hapus User?',
      text: `Apakah Anda yakin ingin menghapus akun ${user.name}? Data profil mahasiswa / dosen terkait juga akan terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        deleteMutation.mutate(user.id);
      }
    });
  };

  const handleResetPassword = (user) => {
    const defaultPass = user.roles?.[0] === 'Admin' ? 'Admin123' : (user.roles?.[0] === 'Dosen' ? 'Dosen123' : 'Mahasiswa123');
    MySwal.fire({
      title: 'Reset Password User?',
      text: `Password akun ${user.name} (${user.email}) akan direset ke default: "${defaultPass}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Reset Password',
      cancelButtonText: 'Batal',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const result = await userService.resetDefaultPassword(user.id);
          toast.success(result.message || `Password berhasil direset ke: ${defaultPass}`);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Gagal mereset password.');
        }
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Kelola User & Role Spatie"
        description="Kelola seluruh kredensial pengguna dan penugasan Hak Akses (Admin, Dosen Wali, Mahasiswa) terintegrasi dengan data NIM, NIDN, dan penetapan Dosen Wali."
        actions={
          <Button icon={Plus} onClick={openCreateModal}>
            Tambah User Baru
          </Button>
        }
      />

      <Card hover={false} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Cari nama, email, NIM, NIDN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-60">
            <Select
              placeholder="Semua Role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Semua Role' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Dosen', label: 'Dosen' },
                { value: 'Mahasiswa', label: 'Mahasiswa' },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card hover={false}>
        {isLoading ? (
          <LoadingSpinner text="Memuat daftar kredensial pengguna & hak akses..." fullHeight />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Nama & Identitas</th>
                    <th className="p-3">Email Akun</th>
                    <th className="p-3">Role Akses</th>
                    <th className="p-3">Informasi Akademik & Wali</th>
                    <th className="p-3">Terdaftar</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300 font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                            {user.avatar || user.mahasiswa?.foto || user.dosen?.foto ? (
                              <img src={user.avatar || user.mahasiswa?.foto || user.dosen?.foto} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold">{user.name}</p>
                            {user.mahasiswa?.nim && (
                              <span className="font-mono text-[10px] text-primary-600 dark:text-primary-400 font-bold">
                                NIM: {user.mahasiswa.nim}
                              </span>
                            )}
                            {user.dosen?.nidn && (
                              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                NIDN: {user.dosen.nidn} {user.dosen.gelar ? `(${user.dosen.gelar})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          user.roles?.[0] === 'Admin'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                            : user.roles?.[0] === 'Dosen'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300'
                        }`}>
                          {user.roles?.[0] || 'User'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {user.mahasiswa?.prodi ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {user.mahasiswa.prodi} ({user.mahasiswa.angkatan})
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span>Wali:</span>
                              <span className="font-medium text-primary-600 dark:text-primary-400">
                                {user.mahasiswa.dosen_wali?.nama_lengkap
                                  ? `${user.mahasiswa.dosen_wali.nama_lengkap}${user.mahasiswa.dosen_wali.gelar ? ', ' + user.mahasiswa.dosen_wali.gelar : ''}`
                                  : 'Belum Ditentukan'}
                              </span>
                            </p>
                          </div>
                        ) : user.dosen?.nidn ? (
                          <span>Dosen Pembimbing Akademik</span>
                        ) : (
                          <span className="text-slate-400">Administrator Sistem</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">{user.created_at || '-'}</td>
                      <td className="p-3 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Reset Password ke Default"
                          className="text-amber-600 hover:text-amber-700"
                          onClick={() => handleResetPassword(user)}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(user)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700" onClick={() => handleDelete(user)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Halaman {meta.current_page || 1} dari {meta.last_page || 1}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="outline" disabled={page >= (meta.last_page || 1)} onClick={() => setPage((p) => p + 1)}>Selanjutnya</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Tambah/Edit User dengan Penugasan Langsung Dosen Wali */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <Select
            label="Role Akses Pengguna"
            options={
              rolesList.length
                ? rolesList
                : [
                    { value: 'Mahasiswa', label: 'Mahasiswa' },
                    { value: 'Dosen', label: 'Dosen' },
                    { value: 'Admin', label: 'Admin' },
                  ]
            }
            {...register('role', { required: 'Role wajib dipilih' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              error={errors.name?.message}
              {...register('name', { required: 'Nama lengkap wajib diisi' })}
            />
            <div>
              <Input
                label="Alamat Email (Akun Login)"
                type="email"
                placeholder={watchedRole === 'Mahasiswa' ? 'Otomatis: [nim]@student.stmikbandung.ac.id' : 'user@stmikbandung.ac.id'}
                error={errors.email?.message}
                {...register('email', {
                  required: watchedRole === 'Mahasiswa' ? false : 'Email wajib diisi',
                  onChange: () => setIsCustomEmail(true),
                })}
              />
              {watchedRole === 'Mahasiswa' && !selectedUser && (
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Default: <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{watchedNim || suggestedNim ? `${(watchedNim || suggestedNim).toLowerCase()}@student.stmikbandung.ac.id` : 'nim@student.stmikbandung.ac.id'}</span> (Boleh dikosongkan untuk memakai default).
                </p>
              )}
            </div>
          </div>

          {!selectedUser && (
            <div>
              <Input
                label={`Password Akun (Default: ${watchedRole === 'Mahasiswa' ? 'Mahasiswa123' : (watchedRole === 'Dosen' ? 'Dosen123' : 'Admin123')})`}
                type="password"
                placeholder={`Kosongkan untuk default: ${watchedRole === 'Mahasiswa' ? 'Mahasiswa123' : (watchedRole === 'Dosen' ? 'Dosen123' : 'Admin123')}`}
                error={errors.password?.message}
                {...register('password', { required: false })}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Password default: <span className="font-semibold text-slate-700 dark:text-slate-300">{watchedRole === 'Mahasiswa' ? 'Mahasiswa123' : (watchedRole === 'Dosen' ? 'Dosen123' : 'Admin123')}</span>. Kosongkan jika ingin memakai password default.
              </p>
            </div>
          )}

          {/* Kondisi 1: Jika Role Mahasiswa -> Munculkan Field NIM, Prodi, Angkatan, & Dosen Wali */}
          {watchedRole === 'Mahasiswa' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                <GraduationCap className="w-4 h-4" />
                <span>Identitas Akademik Mahasiswa</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Jenis Kelamin"
                  options={[
                    { value: 'Laki-laki', label: 'Laki-laki' },
                    { value: 'Perempuan', label: 'Perempuan' },
                  ]}
                  {...register('jenis_kelamin')}
                />
                <Select
                  label="Program Studi"
                  options={[
                    { value: 'Teknik Informatika', label: 'Teknik Informatika (Prefix: 12)' },
                    { value: 'Sistem Informasi', label: 'Sistem Informasi (Prefix: 32)' },
                  ]}
                  {...register('prodi')}
                />
                <Input
                  label="Tahun Angkatan"
                  placeholder="2026"
                  {...register('angkatan')}
                />
              </div>

              {/* NIM Auto-Sequential STMIK Bandung */}
              <div className="space-y-1 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-100 dark:border-blue-900/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>NIM Mahasiswa</span>
                  </label>
                  {!selectedUser && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isCustomNim;
                        setIsCustomNim(next);
                        if (!next && suggestedNim) {
                          setValue('nim', suggestedNim);
                        }
                      }}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 underline cursor-pointer"
                    >
                      {isCustomNim ? 'Gunakan NIM Otomatis' : 'Ketik NIM Manual'}
                    </button>
                  )}
                </div>

                {!isCustomNim && !selectedUser ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={suggestedNim || 'Membuat NIM...'}
                      className="w-full px-3 py-1.5 rounded-xl border border-primary-300 dark:border-primary-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs text-primary-600 dark:text-primary-300 cursor-not-allowed"
                    />
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                      Otomatis
                    </span>
                  </div>
                ) : (
                  <Input
                    placeholder={`Contoh: ${(watchedProdi || '').includes('Informatika') ? '12' : '32'}${(watchedAngkatan || '').slice(-2) || '26'}001`}
                    error={errors.nim?.message}
                    {...register('nim', { required: watchedRole === 'Mahasiswa' ? 'NIM wajib diisi' : false })}
                  />
                )}
                <p className="text-[10px] text-slate-500">
                  Format: {(watchedProdi || '').includes('Informatika') ? 'IF (12)' : 'SI (32)'} + Thn ({(watchedAngkatan || '').slice(-2) || '26'}) + Urutan (001 s/d 010, 099, 100) &rarr; <strong className="font-mono text-primary-600">{suggestedNim || `${(watchedProdi || '').includes('Informatika') ? '12' : '32'}${(watchedAngkatan || '').slice(-2) || '26'}001`}</strong>
                </p>
              </div>

              {/* Dropdown Langsung Pilih Dosen Wali */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                  Dosen Pembimbing Akademik (Dosen Wali)
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                  {...register('dosen_wali_id')}
                >
                  <option value="">-- Pilih Dosen Wali (Bisa Ditentukan Nanti) --</option>
                  {dosenList.map((d) => {
                    const fullTitle = `${d.nama_lengkap}${d.gelar ? ', ' + d.gelar : ''}`;
                    return (
                      <option key={d.id} value={d.id}>
                        {fullTitle} (NIDN: {d.nidn})
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-500">
                  Mahasiswa ini akan langsung masuk ke daftar bimbingan dosen yang dipilih.
                </p>
              </div>
            </div>
          )}

          {/* Kondisi 2: Jika Role Dosen -> Munculkan Field NIDN & Gelar */}
          {watchedRole === 'Dosen' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Users className="w-4 h-4" />
                <span>Identitas Akademik Dosen Wali</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Jenis Kelamin"
                  options={[
                    { value: 'Laki-laki', label: 'Laki-laki' },
                    { value: 'Perempuan', label: 'Perempuan' },
                  ]}
                  {...register('jenis_kelamin')}
                />
                <Input
                  label="NIDN Dosen"
                  placeholder="Contoh: 0412345678"
                  error={errors.nidn?.message}
                  {...register('nidn', { required: watchedRole === 'Dosen' ? 'NIDN wajib diisi' : false })}
                />
                <Input
                  label="Gelar Akademik"
                  placeholder="Contoh: M.T. / M.Kom"
                  {...register('gelar')}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saveMutation.isLoading}>
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
