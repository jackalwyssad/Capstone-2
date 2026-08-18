<?php

namespace App\Services;

use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class UserService
 * Layanan bisnis untuk manajemen pengguna dan penugasan Role Spatie.
 */
class UserService
{
    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getPaginatedUsers(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return $this->userRepository->getAllPaginated($filters, $perPage);
    }

    public function createUser(array $data): User
    {
        $data['password'] = bcrypt($data['password']);
        $role = $data['role'] ?? 'Mahasiswa';
        unset($data['role']);

        $user = $this->userRepository->create($data);
        $user->assignRole($role);

        return $user;
    }

    public function updateUser(User $user, array $data): User
    {
        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
            unset($data['role']);
        }

        return $this->userRepository->update($user, $data);
    }

    public function deleteUser(User $user): bool
    {
        return $this->userRepository->delete($user);
    }
}
