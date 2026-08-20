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
        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $role = $data['role'] ?? 'Mahasiswa';
            $password = bcrypt($data['password']);

            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $password,
                'phone_number' => $data['phone_number'] ?? null,
            ];

            $user = $this->userRepository->create($userData);
            $user->assignRole($role);

            if ($role === 'Mahasiswa') {
                \App\Models\Mahasiswa::create([
                    'user_id' => $user->id,
                    'nim' => $data['nim'] ?? ('MHS' . time()),
                    'nama_lengkap' => $data['name'],
                    'jenis_kelamin' => $data['jenis_kelamin'] ?? 'Laki-laki',
                    'prodi' => $data['prodi'] ?? 'Teknik Informatika',
                    'angkatan' => $data['angkatan'] ?? date('Y'),
                    'dosen_wali_id' => ! empty($data['dosen_wali_id']) ? $data['dosen_wali_id'] : null,
                    'ipk_terakhir' => 0.00,
                    'sks_lulus' => 0,
                ]);
            } elseif ($role === 'Dosen') {
                \App\Models\Dosen::create([
                    'user_id' => $user->id,
                    'nidn' => $data['nidn'] ?? ('DSN' . time()),
                    'nama_lengkap' => $data['name'],
                    'jenis_kelamin' => $data['jenis_kelamin'] ?? 'Laki-laki',
                    'gelar' => $data['gelar'] ?? '',
                    'email' => $data['email'],
                    'no_hp' => $data['phone_number'] ?? null,
                    'kuota_bimbingan' => 20,
                ]);
            }

            return $user->fresh(['roles', 'dosen', 'mahasiswa.dosenWali']);
        });
    }

    public function updateUser(User $user, array $data): User
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($user, $data) {
            if (! empty($data['password'])) {
                $data['password'] = bcrypt($data['password']);
            } else {
                unset($data['password']);
            }

            $role = $data['role'] ?? null;
            if ($role) {
                $user->syncRoles([$role]);
            }

            $nim = $data['nim'] ?? null;
            $jenisKelamin = $data['jenis_kelamin'] ?? null;
            $prodi = $data['prodi'] ?? null;
            $angkatan = $data['angkatan'] ?? null;
            $dosenWaliId = array_key_exists('dosen_wali_id', $data) ? $data['dosen_wali_id'] : null;
            $nidn = $data['nidn'] ?? null;
            $gelar = $data['gelar'] ?? null;

            unset($data['role'], $data['nim'], $data['jenis_kelamin'], $data['prodi'], $data['angkatan'], $data['dosen_wali_id'], $data['nidn'], $data['gelar']);

            $updatedUser = $this->userRepository->update($user, $data);

            if ($user->hasRole('Mahasiswa')) {
                if ($user->mahasiswa) {
                    $user->mahasiswa->update([
                        'nim' => $nim ?? $user->mahasiswa->nim,
                        'nama_lengkap' => $updatedUser->name,
                        'jenis_kelamin' => $jenisKelamin ?? $user->mahasiswa->jenis_kelamin,
                        'prodi' => $prodi ?? $user->mahasiswa->prodi,
                        'angkatan' => $angkatan ?? $user->mahasiswa->angkatan,
                        'dosen_wali_id' => array_key_exists('dosen_wali_id', $data) ? (! empty($dosenWaliId) ? $dosenWaliId : null) : $user->mahasiswa->dosen_wali_id,
                    ]);
                } elseif ($nim) {
                    \App\Models\Mahasiswa::create([
                        'user_id' => $user->id,
                        'nim' => $nim,
                        'nama_lengkap' => $updatedUser->name,
                        'jenis_kelamin' => $jenisKelamin ?? 'Laki-laki',
                        'prodi' => $prodi ?? 'Teknik Informatika',
                        'angkatan' => $angkatan ?? date('Y'),
                        'dosen_wali_id' => ! empty($dosenWaliId) ? $dosenWaliId : null,
                        'ipk_terakhir' => 0.00,
                        'sks_lulus' => 0,
                    ]);
                }
            } elseif ($user->hasRole('Dosen')) {
                if ($user->dosen) {
                    $user->dosen->update([
                        'nidn' => $nidn ?? $user->dosen->nidn,
                        'nama_lengkap' => $updatedUser->name,
                        'jenis_kelamin' => $jenisKelamin ?? $user->dosen->jenis_kelamin,
                        'gelar' => $gelar ?? $user->dosen->gelar,
                    ]);
                } elseif ($nidn) {
                    \App\Models\Dosen::create([
                        'user_id' => $user->id,
                        'nidn' => $nidn,
                        'nama_lengkap' => $updatedUser->name,
                        'jenis_kelamin' => $jenisKelamin ?? 'Laki-laki',
                        'gelar' => $gelar ?? '',
                        'email' => $updatedUser->email,
                        'kuota_bimbingan' => 20,
                    ]);
                }
            }

            return $updatedUser->fresh(['roles', 'dosen', 'mahasiswa.dosenWali']);
        });
    }

    public function deleteUser(User $user): bool
    {
        return $this->userRepository->delete($user);
    }
}
