import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { dosenService } from '../../services/dosenService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForm, useWatch } from 'react-hook-form';
import { Plus, ShieldCheck, Pencil, Trash2, Search, Key, UserCheck, GraduationCap, Users } from 'lucide-react';

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

  const openCreateModal = () => {
    setSelectedUser(null);
    reset({
      name: '',
      email: '',
      password: '',
      role: 'Mahasiswa',
      nim: '',
      prodi: 'Teknik Informatika',
      angkatan: '2024',
      dosen_wali_id: '',
      nidn: '',
      gelar: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    const userRole = user.roles?.[0] || 'Mahasiswa';
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', userRole);
    setValue('nim', user.mahasiswa?.nim || '');
    setValue('prodi', user.mahasiswa?.prodi || 'Teknik Informatika');
    setValue('angkatan', user.mahasiswa?.angkatan || '2024');
    setValue('dosen_wali_id', user.mahasiswa?.dosen_wali_id || '');
    setValue('nidn', user.dosen?.nidn || '');
    setValue('gelar', user.dosen?.gelar || '');
    setIsFormModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (selectedUser) {
        return userService.updateUser(selectedUser.id, data);
      }
      return userService.createUser(data);
    },
    onSuccess: () => {
      toast.success(selectedUser ? 'Data Pengguna diperbarui.' : 'Pengguna baru berhasil ditambahkan.');
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['mahasiswa']);
      queryClient.invalidateQueries(['dosen']);
      queryClient.invalidateQueries(['dosen-all-list']);
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
        userService.deleteUser(user.id).then(() => {
          toast.success('Pengguna berhasil dihapus.');
          queryClient.invalidateQueries(['users']);
          queryClient.invalidateQueries(['mahasiswa']);
          queryClient.invalidateQueries(['dosen']);
        });
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
          <div className="space-y-3 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
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
            <Input
              label="Alamat Email"
              type="email"
              placeholder="user@stmikbandung.ac.id"
              error={errors.email?.message}
              {...register('email', { required: 'Email wajib diisi' })}
            />
          </div>

          {!selectedUser && (
            <Input
              label="Password Akun"
              type="password"
              placeholder="Minimal 6 karakter..."
              error={errors.password?.message}
              {...register('password', { required: 'Password wajib diisi' })}
            />
          )}

          {/* Kondisi 1: Jika Role Mahasiswa -> Munculkan Field NIM, Prodi, Angkatan, & Dosen Wali */}
          {watchedRole === 'Mahasiswa' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                <GraduationCap className="w-4 h-4" />
                <span>Identitas Akademik & Penetapan Dosen Wali</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="NIM"
                  placeholder="Contoh: 3200021"
                  error={errors.nim?.message}
                  {...register('nim', { required: watchedRole === 'Mahasiswa' ? 'NIM wajib diisi' : false })}
                />
                <Select
                  label="Program Studi"
                  options={[
                    { value: 'Teknik Informatika', label: 'Teknik Informatika' },
                    { value: 'Sistem Informasi', label: 'Sistem Informasi' },
                  ]}
                  {...register('prodi')}
                />
                <Input
                  label="Tahun Angkatan"
                  placeholder="2024"
                  {...register('angkatan')}
                />
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
                  💡 Mahasiswa ini akan langsung masuk ke daftar bimbingan dosen yang dipilih.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="NIDN (Nomor Induk Dosen Nasional)"
                  placeholder="Contoh: 0412345678"
                  error={errors.nidn?.message}
                  {...register('nidn', { required: watchedRole === 'Dosen' ? 'NIDN wajib diisi' : false })}
                />
                <Input
                  label="Gelar Akademik (Opsional)"
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
