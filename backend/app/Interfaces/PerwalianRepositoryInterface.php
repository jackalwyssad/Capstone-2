<?php

namespace App\Interfaces;

use App\Models\Perwalian;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface PerwalianRepositoryInterface
 * Kontrak abstraksi data layer untuk transaksi perwalian mahasiswa STMIK Bandung.
 */
interface PerwalianRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function findById(int $id): ?Perwalian;

    public function create(array $data): Perwalian;

    public function update(Perwalian $perwalian, array $data): Perwalian;

    public function delete(Perwalian $perwalian): bool;

    public function getStats(): array;

    public function createLog(int $perwalianId, int $userId, ?string $statusSebelumnya, string $statusBaru, ?string $catatan = null);
}
