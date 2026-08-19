<?php

namespace App\Services;

use App\Interfaces\MahasiswaRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use App\Models\Mahasiswa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Class MahasiswaService
 * Layanan bisnis untuk registrasi Mahasiswa, penetapan Dosen Wali, dan kalkulasi IPK/SKS.
 */
class MahasiswaService
{
    protected MahasiswaRepositoryInterface $mahasiswaRepository;

    protected UserRepositoryInterface $userRepository;

    public function __construct(MahasiswaRepositoryInterface $mahasiswaRepository, UserRepositoryInterface $userRepository)
    {
        $this->mahasiswaRepository = $mahasiswaRepository;
        $this->userRepository = $userRepository;
    }

    public function getPaginatedMahasiswa(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return $this->mahasiswaRepository->getAllPaginated($filters, $perPage);
    }

    public function getMahasiswaById(int $id): ?Mahasiswa
    {
        return $this->mahasiswaRepository->findById($id);
    }

    public function createMahasiswa(array $data): Mahasiswa
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name' => $data['nama_lengkap'],
                'email' => $data['email'] ?? strtolower($data['nim']).'@student.stmikbandung.ac.id',
                'password' => bcrypt($data['password'] ?? 'Mahasiswa123'),
            ]);

            $user->assignRole('Mahasiswa');

            return $this->mahasiswaRepository->create([
                'user_id' => $user->id,
                'nim' => $data['nim'],
                'nama_lengkap' => $data['nama_lengkap'],
                'prodi' => $data['prodi'],
                'angkatan' => $data['angkatan'],
                'dosen_wali_id' => $data['dosen_wali_id'] ?? null,
                'ipk_terakhir' => $data['ipk_terakhir'] ?? 0.00,
                'sks_lulus' => $data['sks_lulus'] ?? 0,
                'foto' => $data['foto'] ?? null,
            ]);
        });
    }

    public function updateMahasiswa(Mahasiswa $mahasiswa, array $data): Mahasiswa
    {
        return DB::transaction(function () use ($mahasiswa, $data) {
            if ($mahasiswa->user) {
                $userUpdates = [];
                if (isset($data['nama_lengkap'])) $userUpdates['name'] = $data['nama_lengkap'];
                if (isset($data['foto'])) $userUpdates['avatar'] = $data['foto'];
                if (!empty($userUpdates)) {
                    $mahasiswa->user->update($userUpdates);
                }
            }

            return $this->mahasiswaRepository->update($mahasiswa, $data);
        });
    }

    public function deleteMahasiswa(Mahasiswa $mahasiswa): bool
    {
        return DB::transaction(function () use ($mahasiswa) {
            if ($mahasiswa->user) {
                $mahasiswa->user->delete();
            }

            return $this->mahasiswaRepository->delete($mahasiswa);
        });
    }

    public function assignDosenWali(array $mahasiswaIds, int $dosenId): bool
    {
        return $this->mahasiswaRepository->assignDosenWali($mahasiswaIds, $dosenId);
    }
}
