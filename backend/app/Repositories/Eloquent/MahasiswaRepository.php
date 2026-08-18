<?php

namespace App\Repositories\Eloquent;

use App\Interfaces\MahasiswaRepositoryInterface;
use App\Models\Mahasiswa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class MahasiswaRepository
 * Implementasi Eloquent ORM untuk data layer Mahasiswa STMIK Bandung.
 */
class MahasiswaRepository implements MahasiswaRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Mahasiswa::with(['user', 'dosenWali']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('nim', 'ilike', "%{$search}%");
            });
        }

        if (! empty($filters['prodi'])) {
            $query->where('prodi', $filters['prodi']);
        }

        if (! empty($filters['angkatan'])) {
            $query->where('angkatan', $filters['angkatan']);
        }

        if (! empty($filters['dosen_wali_id'])) {
            $query->where('dosen_wali_id', $filters['dosen_wali_id']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        return $query->orderBy($sortField, $sortOrder)->paginate($perPage);
    }

    public function findById(int $id): ?Mahasiswa
    {
        return Mahasiswa::with(['user', 'dosenWali.user', 'perwalian.dosen'])->find($id);
    }

    public function findByUserId(int $userId): ?Mahasiswa
    {
        return Mahasiswa::with(['user', 'dosenWali'])->where('user_id', $userId)->first();
    }

    public function create(array $data): Mahasiswa
    {
        return Mahasiswa::create($data);
    }

    public function update(Mahasiswa $mahasiswa, array $data): Mahasiswa
    {
        $mahasiswa->update($data);

        return $mahasiswa->fresh();
    }

    public function delete(Mahasiswa $mahasiswa): bool
    {
        return $mahasiswa->delete();
    }

    public function assignDosenWali(array $mahasiswaIds, int $dosenId): bool
    {
        return Mahasiswa::whereIn('id', $mahasiswaIds)->update(['dosen_wali_id' => $dosenId]) > 0;
    }
}
