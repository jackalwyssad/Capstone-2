<?php

namespace App\Repositories\Eloquent;

use App\Interfaces\AuthRepositoryInterface;
use App\Models\User;

/**
 * Class AuthRepository
 * Implementasi Eloquent ORM untuk data layer autentikasi akun.
 */
class AuthRepository implements AuthRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByNidn(string $nidn): ?User
    {
        return User::whereHas('dosen', function ($q) use ($nidn) {
            $q->where('nidn', $nidn);
        })->first();
    }

    public function createUser(array $data): User
    {
        return User::create($data);
    }

    public function updatePassword(User $user, string $newPassword): bool
    {
        return $user->update(['password' => bcrypt($newPassword)]);
    }
}
