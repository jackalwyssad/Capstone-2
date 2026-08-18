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

    public function createUser(array $data): User
    {
        return User::create($data);
    }

    public function updatePassword(User $user, string $newPassword): bool
    {
        return $user->update(['password' => bcrypt($newPassword)]);
    }
}
