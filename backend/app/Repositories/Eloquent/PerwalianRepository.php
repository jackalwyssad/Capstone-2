<?php

namespace App\Repositories\Eloquent;

use App\Interfaces\PerwalianRepositoryInterface;
use App\Models\Perwalian;
use App\Models\PerwalianLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Class PerwalianRepository
 * Implementasi Eloquent ORM untuk data layer perwalian mahasiswa STMIK Bandung.
 */
class PerwalianRepository implements PerwalianRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Perwalian::with(['mahasiswa.user', 'dosen.user']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('mahasiswa', function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('nim', 'ilike', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['semester'])) {
            $query->where('semester', $filters['semester']);
        }

        if (! empty($filters['mahasiswa_id'])) {
            $query->where('mahasiswa_id', $filters['mahasiswa_id']);
        }

        if (! empty($filters['dosen_id'])) {
            $query->where('dosen_id', $filters['dosen_id']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        return $query->orderBy($sortField, $sortOrder)->paginate($perPage);
    }

    public function findById(int $id): ?Perwalian
    {
        return Perwalian::with(['mahasiswa.user', 'dosen.user', 'logs.user'])->find($id);
    }

    public function create(array $data): Perwalian
    {
        return Perwalian::create($data);
    }

    public function update(Perwalian $perwalian, array $data): Perwalian
    {
        $perwalian->update($data);

        return $perwalian->fresh();
    }

    public function delete(Perwalian $perwalian): bool
    {
        return $perwalian->delete();
    }

    public function getStats(): array
    {
        $totalPerwalian = Perwalian::count();
        $pending = Perwalian::where('status', 'Pending')->count();
        $approved = Perwalian::where('status', 'Disetujui')->count();
        $rejected = Perwalian::where('status', 'Ditolak')->count();

        // Data rekap per semester untuk grafik Recharts
        $perSemester = Perwalian::select('semester', DB::raw('count(*) as total'))
            ->groupBy('semester')
            ->orderBy('semester', 'asc')
            ->get();

        return [
            'total' => $totalPerwalian,
            'pending' => $pending,
            'approved' => $approved,
            'rejected' => $rejected,
            'per_semester' => $perSemester,
        ];
    }

    public function createLog(int $perwalianId, int $userId, ?string $statusSebelumnya, string $statusBaru, ?string $catatan = null)
    {
        return PerwalianLog::create([
            'perwalian_id' => $perwalianId,
            'user_id' => $userId,
            'status_sebelumnya' => $statusSebelumnya,
            'status_baru' => $statusBaru,
            'catatan' => $catatan,
        ]);
    }
}
