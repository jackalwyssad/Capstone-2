<?php

namespace App\Interfaces;

use App\Models\Dosen;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface DosenRepositoryInterface
 * Kontrak abstraksi data layer untuk data Dosen Wali STMIK Bandung.
 */
interface DosenRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function getAllList(): Collection;

    public function findById(int $id): ?Dosen;

    public function findByUserId(int $userId): ?Dosen;

    public function create(array $data): Dosen;

    public function update(Dosen $dosen, array $data): Dosen;

    public function delete(Dosen $dosen): bool;
}
