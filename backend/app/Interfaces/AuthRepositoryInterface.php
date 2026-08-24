<?php

namespace App\Interfaces;

use App\Models\User;

/**
 * Interface AuthRepositoryInterface
 * Kontrak abstraksi data layer untuk proses autentikasi akun user.
 */
interface AuthRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function findByNidn(string $nidn): ?User;

    public function createUser(array $data): User;

    public function updatePassword(User $user, string $newPassword): bool;
}
