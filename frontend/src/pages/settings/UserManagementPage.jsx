import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
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
import { useForm } from 'react-hook-form';
import { Plus, ShieldCheck, Pencil, Trash2, Search } from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Kelola User & Role Spatie (Admin Only)
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

  const usersList = usersResponse?.data || [];
  const meta = usersResponse?.meta || {};
  const rolesList = (rolesResponse?.data || []).map((r) => ({ value: r.name, label: r.name }));

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const openCreateModal = () => {
    setSelectedUser(null);
    reset({ name: '', email: '', password: '', role: 'Mahasiswa' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.roles?.[0] || 'Mahasiswa');
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
      toast.success(selectedUser ? 'Pengguna diperbarui.' : 'Pengguna berhasil dibuat.');
      queryClient.invalidateQueries(['users']);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengguna.');
    },
  });

  const handleDelete = (user) => {
    MySwal.fire({
      title: 'Hapus User?',
      text: `Apakah Anda yakin ingin menghapus akun ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus',
    }).then((res) => {
      if (res.isConfirmed) {
        userService.deleteUser(user.id).then(() => {
          toast.success('Pengguna berhasil dihapus.');
          queryClient.invalidateQueries(['users']);
        });
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Kelola User & Role Spatie"
        description="Kelola seluruh kredensial pengguna dan penugasan Hak Akses (Admin, Dosen Wali, Mahasiswa)."
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
              placeholder="Cari nama atau email user..."
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
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role Spatie</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-semibold">#{user.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-800">
                          {user.roles?.[0] || 'No Role'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(user)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleDelete(user)}>
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

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedUser ? 'Edit User & Role' : 'Tambah User Baru'}>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <Input label="Nama Lengkap" placeholder="Nama User" error={errors.name?.message} {...register('name', { required: 'Nama wajib diisi' })} />
          <Input label="Email" type="email" placeholder="user@stmikbandung.ac.id" error={errors.email?.message} {...register('email', { required: 'Email wajib diisi' })} />
          {!selectedUser && <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password', { required: 'Password wajib diisi' })} />}
          <Select label="Role Spatie" options={rolesList.length ? rolesList : [{ value: 'Admin', label: 'Admin' }, { value: 'Dosen', label: 'Dosen' }, { value: 'Mahasiswa', label: 'Mahasiswa' }]} {...register('role')} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={saveMutation.isLoading}>Simpan User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
