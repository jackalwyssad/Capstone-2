<?php

namespace App\Services;

use App\Interfaces\DosenRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use App\Models\Dosen;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class DosenService
 * Layanan bisnis untuk registrasi dan pengolahan data Dosen Wali STMIK Bandung.
 */
class DosenService
{
    protected DosenRepositoryInterface $dosenRepository;

    protected UserRepositoryInterface $userRepository;

    public function __construct(DosenRepositoryInterface $dosenRepository, UserRepositoryInterface $userRepository)
    {
        $this->dosenRepository = $dosenRepository;
        $this->userRepository = $userRepository;
    }

    public function getPaginatedDosen(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return $this->dosenRepository->getAllPaginated($filters, $perPage);
    }

    public function getDosenList(): Collection
    {
        return $this->dosenRepository->getAllList();
    }

    public function getDosenById(int $id): ?Dosen
    {
        return $this->dosenRepository->findById($id);
    }

    /**
     * Membuat akun User baru + Profil Dosen secara atomic transaksi.
     */
    public function createDosen(array $data): Dosen
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name' => $data['nama_lengkap'],
                'email' => $data['email'],
                'password' => bcrypt($data['password'] ?? 'Dosen123'),
                'phone_number' => $data['no_hp'] ?? null,
            ]);

            $user->assignRole('Dosen');

            return $this->dosenRepository->create([
                'user_id' => $user->id,
                'nidn' => $data['nidn'],
                'nama_lengkap' => $data['nama_lengkap'],
                'jenis_kelamin' => $data['jenis_kelamin'] ?? 'Laki-laki',
                'gelar' => $data['gelar'],
                'email' => $data['email'],
                'no_hp' => $data['no_hp'] ?? null,
                'tempat_lahir' => $data['tempat_lahir'] ?? null,
                'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                'pendidikan_terakhir' => $data['pendidikan_terakhir'] ?? null,
                'alamat' => $data['alamat'] ?? null,
                'foto' => $data['foto'] ?? null,
                'kuota_bimbingan' => $data['kuota_bimbingan'] ?? 30,
            ]);
        });
    }

    public function updateDosen(Dosen $dosen, array $data): Dosen
    {
        return DB::transaction(function () use ($dosen, $data) {
            if ($dosen->user) {
                $userUpdates = [];
                if (isset($data['nama_lengkap'])) $userUpdates['name'] = $data['nama_lengkap'];
                if (isset($data['email'])) $userUpdates['email'] = $data['email'];
                if (isset($data['foto'])) $userUpdates['avatar'] = $data['foto'];
                if (isset($data['no_hp'])) $userUpdates['phone_number'] = $data['no_hp'];
                if (!empty($userUpdates)) {
                    $dosen->user->update($userUpdates);
                }
            }

            return $this->dosenRepository->update($dosen, $data);
        });
    }

    public function deleteDosen(Dosen $dosen): bool
    {
        return DB::transaction(function () use ($dosen) {
            if ($dosen->user) {
                $dosen->user->delete();
            }

            return $this->dosenRepository->delete($dosen);
        });
    }
}
