<?php

namespace App\Interfaces;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface UserRepositoryInterface
 * Kontrak abstraksi data layer untuk manajemen akun user (Admin, Dosen, Mahasiswa).
 */
interface UserRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function findById(int $id): ?User;

    public function create(array $data): User;

    public function update(User $user, array $data): User;

    public function delete(User $user): bool;
}
