<?php

namespace App\Repositories\Eloquent;

use App\Interfaces\DosenRepositoryInterface;
use App\Models\Dosen;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class DosenRepository
 * Implementasi Eloquent ORM untuk data layer Dosen Wali STMIK Bandung.
 */
class DosenRepository implements DosenRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Dosen::with(['user'])->withCount(['mahasiswaBimbingan', 'perwalian']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('nidn', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        return $query->orderBy($sortField, $sortOrder)->paginate($perPage);
    }

    public function getAllList(): Collection
    {
        return Dosen::select('id', 'nama_lengkap', 'nidn', 'gelar', 'kuota_bimbingan', 'email', 'no_hp', 'pendidikan_terakhir', 'foto')
            ->withCount(['mahasiswaBimbingan', 'perwalian'])
            ->orderBy('nama_lengkap', 'asc')
            ->get();
    }

    public function findById(int $id): ?Dosen
    {
        return Dosen::with(['user', 'mahasiswaBimbingan.user', 'perwalian'])->withCount(['mahasiswaBimbingan', 'perwalian'])->find($id);
    }

    public function findByUserId(int $userId): ?Dosen
    {
        return Dosen::where('user_id', $userId)->first();
    }

    public function create(array $data): Dosen
    {
        return Dosen::create($data);
    }

    public function update(Dosen $dosen, array $data): Dosen
    {
        $dosen->update($data);

        return $dosen->fresh();
    }

    public function delete(Dosen $dosen): bool
    {
        return $dosen->delete();
    }
}
