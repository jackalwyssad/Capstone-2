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
import { EmptyState } from '../../components/common/EmptyState';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useForm } from 'react-hook-form';
import { Search, Plus, UserCheck, Pencil, Trash2, Users } from 'lucide-react';

const MySwal = withReactContent(Swal);

/**
 * Halaman Kelola Data Dosen Wali STMIK Bandung (Admin)
 * Mendukung CRUD Dosen Wali, Penetapan (Assign Wali) Mahasiswa Bimbingan, dan Monitoring Kuota.
 */
export const DosenListPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [selectedMhsIds, setSelectedMhsIds] = useState([]);

  // Fetch Dosen List
  const { data: dosenResponse, isLoading } = useQuery({
    queryKey: ['dosen', page, search],
    queryFn: () => dosenService.getDosen({ page, search, per_page: 10 }),
  });

  // Fetch Mahasiswa untuk Assign
  const { data: mhsResponse } = useQuery({
    queryKey: ['mahasiswa-unassigned'],
    queryFn: () => mahasiswaService.getMahasiswa({ per_page: 100 }),
    enabled: isAssignModalOpen,
  });

  const dosenList = dosenResponse?.data || [];
  const meta = dosenResponse?.meta || {};
  const unassignedMhsList = mhsResponse?.data || [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const openCreateModal = () => {
    setSelectedDosen(null);
    reset({
      nidn: '',
      nama_lengkap: '',
      gelar: 'M.T.',
      email: '',
      no_hp: '',
      kuota_bimbingan: 30,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (dosen) => {
    setSelectedDosen(dosen);
    setValue('nidn', dosen.nidn);
    setValue('nama_lengkap', dosen.nama_lengkap);
    setValue('gelar', dosen.gelar);
    setValue('email', dosen.email);
    setValue('no_hp', dosen.no_hp || '');
    setValue('kuota_bimbingan', dosen.kuota_bimbingan);
    setIsFormModalOpen(true);
  };

  const openAssignModal = (dosen) => {
    setSelectedDosen(dosen);
    setSelectedMhsIds([]);
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
    onSuccess: () => {
      toast.success(selectedDosen ? 'Data Dosen Wali diperbarui.' : 'Dosen Wali berhasil dibuat.');
      queryClient.invalidateQueries(['dosen']);
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data dosen.');
    },
  });

  // Mutation Assign Dosen Wali
  const assignMutation = useMutation({
    mutationFn: () => dosenService.assignWali({ dosen_id: selectedDosen.id, mahasiswa_ids: selectedMhsIds }),
    onSuccess: () => {
      toast.success('Berhasil me-assign Dosen Wali ke mahasiswa terpilih.');
      queryClient.invalidateQueries(['dosen']);
      queryClient.invalidateQueries(['mahasiswa']);
      setIsAssignModalOpen(false);
    },
    onError: (err) => {
      toast.error('Gagal menugaskan Dosen Wali.');
    },
  });

  const handleDelete = (dosen) => {
    MySwal.fire({
      title: 'Hapus Dosen Wali?',
      text: `Apakah Anda yakin menghapus Dosen ${dosen.nama_lengkap}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        dosenService.deleteDosen(dosen.id).then(() => {
          toast.success('Dosen Wali berhasil dihapus.');
          queryClient.invalidateQueries(['dosen']);
        });
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Dosen Wali"
        description="Kelola data Dosen Pembimbing Akademik STMIK Bandung dan penetapan kuota bimbingan."
        actions={
          <Button icon={Plus} onClick={openCreateModal}>
            Tambah Dosen Wali
          </Button>
        }
      />

      {/* Filter Bar */}
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
          <div className="space-y-3 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : dosenList.length === 0 ? (
          <EmptyState title="Data Dosen Kosong" description="Belum ada Dosen Wali terdaftar." />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">NIDN</th>
                    <th className="p-3">Nama Dosen & Gelar</th>
                    <th className="p-3">Email Official</th>
                    <th className="p-3">No. WhatsApp</th>
                    <th className="p-3">Kuota Bimbingan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {dosenList.map((dosen) => (
                    <tr key={dosen.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-primary-600 dark:text-primary-400">{dosen.nidn}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{dosen.nama_lengkap}</td>
                      <td className="p-3">{dosen.email}</td>
                      <td className="p-3">{dosen.no_hp || '-'}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {dosen.total_mahasiswa_bimbingan}
                        </span>{' '}
                        / {dosen.kuota_bimbingan} Mahasiswa
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button size="sm" variant="outline" icon={UserCheck} onClick={() => openAssignModal(dosen)}>
                          Assign Wali
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(dosen)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleDelete(dosen)}>
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
              <span className="text-slate-500">Halaman {meta.current_page || 1} dari {meta.last_page || 1}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="outline" disabled={page >= (meta.last_page || 1)} onClick={() => setPage(p => p + 1)}>Selanjutnya</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form Dosen */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedDosen ? 'Edit Data Dosen Wali' : 'Tambah Dosen Wali Baru'}>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <Input label="NIDN Dosen" placeholder="0401018501" error={errors.nidn?.message} {...register('nidn', { required: 'NIDN wajib diisi' })} />
          <Input label="Nama Lengkap Beserta Gelar" placeholder="Dr. Irwan Setiawan, M.T." error={errors.nama_lengkap?.message} {...register('nama_lengkap', { required: 'Nama wajib diisi' })} />
          <Input label="Gelar Akademik" placeholder="M.T." {...register('gelar')} />
          <Input label="Email Official" type="email" placeholder="dosen@stmikbandung.ac.id" error={errors.email?.message} {...register('email', { required: 'Email wajib diisi' })} />
          <Input label="No. WhatsApp" placeholder="081234567890" {...register('no_hp')} />
          <Input label="Kuota Maksimal Bimbingan" type="number" placeholder="30" {...register('kuota_bimbingan')} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={saveMutation.isLoading}>Simpan Dosen</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Assign Mahasiswa */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Penetapan Dosen Wali: ${selectedDosen?.nama_lengkap}`}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Pilih mahasiswa yang akan dibimbing oleh Dosen Wali ini:</p>
          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
            {unassignedMhsList.map((mhs) => (
              <label key={mhs.id} className="flex items-center gap-3 text-xs font-semibold p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMhsIds.includes(mhs.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedMhsIds([...selectedMhsIds, mhs.id]);
                    else setSelectedMhsIds(selectedMhsIds.filter(id => id !== mhs.id));
                  }}
                  className="rounded border-slate-400 text-primary-600"
                />
                <span>{mhs.nim} - {mhs.nama_lengkap} ({mhs.prodi})</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Batal</Button>
            <Button onClick={() => assignMutation.mutate()} isLoading={assignMutation.isLoading}>Simpan Penetapan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
