<?php

namespace App\Interfaces;

use App\Models\Mahasiswa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface MahasiswaRepositoryInterface
 * Kontrak abstraksi data layer untuk data Mahasiswa STMIK Bandung.
 */
interface MahasiswaRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function findById(int $id): ?Mahasiswa;

    public function findByUserId(int $userId): ?Mahasiswa;

    public function create(array $data): Mahasiswa;

    public function update(Mahasiswa $mahasiswa, array $data): Mahasiswa;

    public function delete(Mahasiswa $mahasiswa): bool;

    public function assignDosenWali(array $mahasiswaIds, int $dosenId): bool;
}
